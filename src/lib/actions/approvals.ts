'use server';

import { createClient } from '@/lib/supabase/server';

export async function approveGoalSheet(goalSheetId: string, comment?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('goal_sheets')
    .update({
      status: 'approved',
      locked: true,
      approved_at: new Date().toISOString(),
      manager_comment: comment || null,
    })
    .eq('id', goalSheetId);
  if (error) throw new Error(error.message);

  await supabase.from('goals').update({ status: 'approved' }).eq('goal_sheet_id', goalSheetId);

  await supabase.from('audit_logs').insert({
    user_id: user.id, action: 'approved', entity_type: 'goal_sheet',
    entity_id: goalSheetId,
    old_value: JSON.stringify({ status: 'submitted' }),
    new_value: JSON.stringify({ status: 'approved', comment }),
  });
  return true;
}

export async function sendBackGoalSheet(goalSheetId: string, comment: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('goal_sheets')
    .update({
      status: 'sent_back',
      locked: false,
      manager_comment: comment,
    })
    .eq('id', goalSheetId);
  if (error) throw new Error(error.message);

  await supabase.from('goals').update({ status: 'sent_back' }).eq('goal_sheet_id', goalSheetId);

  await supabase.from('audit_logs').insert({
    user_id: user.id, action: 'sent_back', entity_type: 'goal_sheet',
    entity_id: goalSheetId,
    old_value: JSON.stringify({ status: 'submitted' }),
    new_value: JSON.stringify({ status: 'sent_back', comment }),
  });
  return true;
}

export async function updateGoalAsManager(goalId: string, updates: { target_value?: number; weightage?: number }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: old } = await supabase.from('goals').select('target_value, weightage').eq('id', goalId).single();
  const { error } = await supabase.from('goals').update(updates).eq('id', goalId);
  if (error) throw new Error(error.message);

  await supabase.from('audit_logs').insert({
    user_id: user.id, action: 'manager_edit', entity_type: 'goal',
    entity_id: goalId,
    old_value: JSON.stringify(old),
    new_value: JSON.stringify(updates),
  });
  return true;
}
