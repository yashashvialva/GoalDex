import { z } from 'zod';

// Single goal schema
export const goalSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(150, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description too long'),
  thrust_area: z.string().min(1, 'Thrust area is required'),
  uom_type: z.enum(['numeric', 'percentage', 'timeline', 'zero_based'], {
    required_error: 'Unit of measurement is required',
  }),
  target_value: z.number().min(0, 'Target must be positive'),
  weightage: z.number()
    .min(10, 'Minimum weightage is 10%')
    .max(100, 'Maximum weightage is 100%'),
  is_shared_goal: z.boolean().default(false),
  shared_goal_id: z.string().nullable().optional(),
});

export type GoalFormValues = z.infer<typeof goalSchema>;

// Goal sheet validation (for submission)
export const validateGoalSheet = (goals: { weightage: number }[]) => {
  const errors: string[] = [];

  if (goals.length === 0) {
    errors.push('You must add at least one goal.');
  }

  if (goals.length > 8) {
    errors.push('Maximum 8 goals are allowed per sheet.');
  }

  const totalWeightage = goals.reduce((sum, g) => sum + g.weightage, 0);
  if (totalWeightage !== 100) {
    errors.push(`Total weightage must equal exactly 100%. Current: ${totalWeightage}%`);
  }

  const invalidWeightage = goals.filter(g => g.weightage < 10);
  if (invalidWeightage.length > 0) {
    errors.push(`Each goal must have a minimum weightage of 10%.`);
  }

  return errors;
};

// Quarterly check-in schema
export const checkinSchema = z.object({
  actual_achievement: z.number().min(0, 'Achievement must be positive'),
  status: z.enum(['not_started', 'on_track', 'completed'], {
    required_error: 'Status is required',
  }),
  employee_comment: z.string().max(500, 'Comment too long').optional(),
});

export type CheckinFormValues = z.infer<typeof checkinSchema>;

// Manager comment schema
export const managerCommentSchema = z.object({
  manager_comment: z.string().min(1, 'Comment is required').max(500, 'Comment too long'),
});

export type ManagerCommentValues = z.infer<typeof managerCommentSchema>;

// Shared goal schema
export const sharedGoalSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  target: z.number().min(1, 'Target must be positive'),
  department: z.string().min(1, 'Department is required'),
});

export type SharedGoalFormValues = z.infer<typeof sharedGoalSchema>;
