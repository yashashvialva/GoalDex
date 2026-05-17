'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentCycleYear } from '@/lib/utils/helpers';
import { GoalFormValues } from '@/lib/validations/goalSchema';

// ---------- GOAL SHEET ----------

export async function getOrCreateGoalSheet() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const year = getCurrentCycleYear();

    // Try to get existing
    const { data: sheet, error: fetchError } = await supabase
      .from('goal_sheets')
      .select('*')
      .eq('employee_id', user.id)
      .eq('cycle_year', year);

    if (fetchError) {
      console.error('Error fetching goal sheet:', fetchError);
      throw new Error(`Failed to check existing goal sheet: ${fetchError.message}`);
    }

    let activeSheet = sheet && sheet.length > 0 ? sheet[0] : null;

    // Create if not exists
    if (!activeSheet) {
      console.log('No goal sheet found. Creating a new one for employee:', user.id, 'for year:', year);
      const { data: newSheet, error: insertError } = await supabase
        .from('goal_sheets')
        .insert({
          employee_id: user.id,
          cycle_year: year,
          status: 'draft',
          total_weightage: 0,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting new goal sheet:', insertError);
        throw new Error(`Failed to create goal sheet: ${insertError.message}`);
      }
      
      activeSheet = newSheet;

      // Audit log
      const { error: auditError } = await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'created',
        entity_type: 'goal_sheet',
        entity_id: newSheet.id,
        new_value: JSON.stringify({ cycle_year: year }),
      });
      
      if (auditError) {
        console.error('Failed to write audit log:', auditError);
      }
    }

    return activeSheet;
  } catch (err: any) {
    console.error('CRITICAL ERROR in getOrCreateGoalSheet:', err);
    throw err;
  }
}

export async function getGoals(goalSheetId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('goal_sheet_id', goalSheetId)
    .order('created_at');

  if (error) throw new Error(error.message);
  return data || [];
}

// ---------- GOAL CRUD ----------

export async function createGoal(goalSheetId: string, values: GoalFormValues) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Check sheet is not locked
  const { data: sheet } = await supabase
    .from('goal_sheets')
    .select('locked, status')
    .eq('id', goalSheetId)
    .single();

  if (sheet?.locked) throw new Error('Goal sheet is locked. Cannot add goals.');
  if (sheet?.status === 'approved') throw new Error('Goal sheet is approved. Cannot modify.');

  // Check max 8 goals
  const { count } = await supabase
    .from('goals')
    .select('*', { count: 'exact', head: true })
    .eq('goal_sheet_id', goalSheetId);

  if ((count || 0) >= 8) throw new Error('Maximum 8 goals allowed per sheet.');

  // Insert goal
  const { data: goal, error } = await supabase
    .from('goals')
    .insert({
      goal_sheet_id: goalSheetId,
      title: values.title,
      description: values.description,
      thrust_area: values.thrust_area,
      uom_type: values.uom_type,
      target_value: values.target_value,
      weightage: values.weightage,
      is_shared_goal: values.is_shared_goal || false,
      shared_goal_id: values.shared_goal_id || null,
      status: 'draft',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Update total weightage
  await updateSheetWeightage(goalSheetId);

  // Audit
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'created',
    entity_type: 'goal',
    entity_id: goal.id,
    new_value: JSON.stringify({ title: values.title, weightage: values.weightage }),
  });

  return goal;
}

export async function updateGoal(goalId: string, values: Partial<GoalFormValues>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Get existing goal to check lock status
  const { data: existing } = await supabase
    .from('goals')
    .select('*, goal_sheets!inner(locked, status, employee_id)')
    .eq('id', goalId)
    .single();

  if (!existing) throw new Error('Goal not found');

  const sheet = (existing as any).goal_sheets;
  if (sheet.locked) throw new Error('Goal sheet is locked.');
  if (sheet.status === 'approved') throw new Error('Cannot edit approved goals.');

  // Shared goal check: only weightage editable
  if (existing.is_shared_goal) {
    const { error } = await supabase
      .from('goals')
      .update({ weightage: values.weightage })
      .eq('id', goalId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from('goals')
      .update({
        title: values.title,
        description: values.description,
        thrust_area: values.thrust_area,
        uom_type: values.uom_type,
        target_value: values.target_value,
        weightage: values.weightage,
      })
      .eq('id', goalId);
    if (error) throw new Error(error.message);
  }

  // Update weightage
  await updateSheetWeightage(existing.goal_sheet_id);

  // Audit
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'updated',
    entity_type: 'goal',
    entity_id: goalId,
    old_value: JSON.stringify({ title: existing.title, weightage: existing.weightage }),
    new_value: JSON.stringify({ title: values.title, weightage: values.weightage }),
  });

  return true;
}

export async function deleteGoal(goalId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: goal } = await supabase
    .from('goals')
    .select('goal_sheet_id, title')
    .eq('id', goalId)
    .single();

  if (!goal) throw new Error('Goal not found');

  const { error } = await supabase.from('goals').delete().eq('id', goalId);
  if (error) throw new Error(error.message);

  await updateSheetWeightage(goal.goal_sheet_id);

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'deleted',
    entity_type: 'goal',
    entity_id: goalId,
    old_value: JSON.stringify({ title: goal.title }),
  });

  return true;
}

// ---------- SUBMIT ----------

export async function submitGoalSheet(goalSheetId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Validate total weightage = 100
  const { data: goals } = await supabase
    .from('goals')
    .select('weightage')
    .eq('goal_sheet_id', goalSheetId);

  if (!goals || goals.length === 0) throw new Error('Add at least one goal before submitting.');
  if (goals.length > 8) throw new Error('Maximum 8 goals allowed.');

  const total = goals.reduce((sum, g) => sum + g.weightage, 0);
  if (total !== 100) throw new Error(`Total weightage must be exactly 100%. Currently: ${total}%`);

  const minW = goals.filter(g => g.weightage < 10);
  if (minW.length > 0) throw new Error('Each goal must have at least 10% weightage.');

  // Update sheet status
  const { error } = await supabase
    .from('goal_sheets')
    .update({
      status: 'submitted',
      total_weightage: 100,
      submitted_at: new Date().toISOString(),
    })
    .eq('id', goalSheetId);

  if (error) throw new Error(error.message);

  // Update all goals status
  await supabase
    .from('goals')
    .update({ status: 'submitted' })
    .eq('goal_sheet_id', goalSheetId);

  // Audit
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'submitted',
    entity_type: 'goal_sheet',
    entity_id: goalSheetId,
    old_value: JSON.stringify({ status: 'draft' }),
    new_value: JSON.stringify({ status: 'submitted' }),
  });

  return true;
}

// ---------- HELPERS ----------

async function updateSheetWeightage(goalSheetId: string) {
  const supabase = await createClient();
  const { data: goals } = await supabase
    .from('goals')
    .select('weightage')
    .eq('goal_sheet_id', goalSheetId);

  const total = goals?.reduce((sum, g) => sum + g.weightage, 0) || 0;

  await supabase
    .from('goal_sheets')
    .update({ total_weightage: total })
    .eq('id', goalSheetId);
}
