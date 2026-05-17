'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Card, CardContent, TextField, Button, Stack,
  MenuItem, Select, InputLabel, FormControl, FormHelperText, alpha,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSnackbar } from 'notistack';
import { goalSchema, GoalFormValues } from '@/lib/validations/goalSchema';
import { getOrCreateGoalSheet, createGoal } from '@/lib/actions/goals';

const THRUST_AREAS = [
  'Technical Excellence', 'Quality', 'Delivery', 'People',
  'Innovation', 'Customer Focus', 'Operational', 'Strategic',
];

const UOM_OPTIONS = [
  { value: 'numeric', label: 'Numeric (Higher is better)' },
  { value: 'percentage', label: 'Percentage (Higher is better)' },
  { value: 'timeline', label: 'Timeline (Lower is better)' },
  { value: 'zero_based', label: 'Zero-based (Zero = 100%)' },
];

export default function NewGoalPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [saving, setSaving] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: '', description: '', thrust_area: '',
      uom_type: 'numeric', target_value: 0, weightage: 10,
      is_shared_goal: false,
    },
  });

  const onSubmit = async (values: GoalFormValues) => {
    setSaving(true);
    try {
      const sheet = await getOrCreateGoalSheet();
      await createGoal(sheet.id, values);
      enqueueSnackbar('Goal created successfully! ✅', { variant: 'success' });
      router.refresh();
      router.push('/employee/goals');
    } catch (err: any) {
      enqueueSnackbar(err.message || 'Failed to create goal', { variant: 'error' });
    }
    setSaving(false);
  };

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => router.push('/employee/goals')}
        sx={{ mb: 2, color: 'text.secondary' }}>Back to Goals</Button>

      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Create New Goal</Typography>

      <Card sx={{ maxWidth: 720 }}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <Controller name="title" control={control}
                render={({ field }) => (
                  <TextField {...field} label="Goal Title" fullWidth error={!!errors.title}
                    helperText={errors.title?.message} placeholder="e.g. Increase API Response Time" />
                )} />

              <Controller name="description" control={control}
                render={({ field }) => (
                  <TextField {...field} label="Description" fullWidth multiline rows={3}
                    error={!!errors.description} helperText={errors.description?.message}
                    placeholder="Describe the goal, expected outcomes, and success criteria" />
                )} />

              <Controller name="thrust_area" control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.thrust_area}>
                    <InputLabel>Thrust Area</InputLabel>
                    <Select {...field} label="Thrust Area">
                      {THRUST_AREAS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </Select>
                    {errors.thrust_area && <FormHelperText>{errors.thrust_area.message}</FormHelperText>}
                  </FormControl>
                )} />

              <Controller name="uom_type" control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.uom_type}>
                    <InputLabel>Unit of Measurement</InputLabel>
                    <Select {...field} label="Unit of Measurement">
                      {UOM_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                    </Select>
                    {errors.uom_type && <FormHelperText>{errors.uom_type.message}</FormHelperText>}
                  </FormControl>
                )} />

              <Stack direction="row" spacing={2}>
                <Controller name="target_value" control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Target Value" type="number" fullWidth
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      error={!!errors.target_value} helperText={errors.target_value?.message} />
                  )} />

                <Controller name="weightage" control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Weightage (%)" type="number" fullWidth
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      error={!!errors.weightage} helperText={errors.weightage?.message || 'Min 10%, total must be 100%'}
                      slotProps={{ input: { min: 10, max: 100, step: 5 } }} />
                  )} />
              </Stack>

              <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', pt: 2 }}>
                <Button variant="outlined" onClick={() => router.push('/employee/goals')}>Cancel</Button>
                <Button type="submit" variant="contained" startIcon={<Save />} disabled={saving}
                  sx={{ px: 4 }}>{saving ? 'Saving...' : 'Save Goal'}</Button>
              </Stack>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
