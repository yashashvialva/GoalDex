'use server';

import { createClient } from '@/lib/supabase/server';
import { calculateProgressScore } from '@/lib/utils/scoring';
import { UoMType } from '@/lib/types';

export async function upsertCheckin(
  goalId: string,
  quarter: string,
  data: { actual_achievement: number; status: string; employee_comment?: string }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Get goal for scoring
  const { data: goal } = await supabase.from('goals').select('target_value, uom_type').eq('id', goalId).single();
  if (!goal) throw new Error('Goal not found');

  // Upsert checkin
  const { data: existing } = await supabase
    .from('quarterly_checkins')
    .select('id')
    .eq('goal_id', goalId)
    .eq('quarter', quarter)
    .single();

  if (existing) {
    await supabase.from('quarterly_checkins').update({
      actual_achievement: data.actual_achievement,
      status: data.status,
      employee_comment: data.employee_comment || null,
      updated_at: new Date().toISOString(),
    }).eq('id', existing.id);
  } else {
    await supabase.from('quarterly_checkins').insert({
      goal_id: goalId,
      quarter,
      planned_target: Number(goal.target_value),
      actual_achievement: data.actual_achievement,
      status: data.status,
      employee_comment: data.employee_comment || null,
    });
  }

  // Update goal achievement & score
  const score = calculateProgressScore(goal.uom_type as UoMType, Number(goal.target_value), data.actual_achievement);
  await supabase.from('goals').update({
    achievement_value: data.actual_achievement,
    progress_score: score,
  }).eq('id', goalId);

  await supabase.from('audit_logs').insert({
    user_id: user.id, action: 'updated', entity_type: 'checkin',
    entity_id: goalId,
    new_value: JSON.stringify({ quarter, achievement: data.actual_achievement }),
  });
  return true;
}

export async function addManagerCheckinComment(checkinId: string, comment: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('quarterly_checkins')
    .update({ manager_comment: comment, updated_at: new Date().toISOString() })
    .eq('id', checkinId);
  if (error) throw new Error(error.message);

  await supabase.from('audit_logs').insert({
    user_id: user.id, action: 'commented', entity_type: 'checkin',
    entity_id: checkinId,
    new_value: JSON.stringify({ comment }),
  });
  return true;
}
