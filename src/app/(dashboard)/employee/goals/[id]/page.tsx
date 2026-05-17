'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box, Typography, Card, CardContent, TextField, Button, Stack,
  MenuItem, Select, InputLabel, FormControl, FormHelperText,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSnackbar } from 'notistack';
import LoadingScreen from '@/components/shared/LoadingScreen';
import { goalSchema, GoalFormValues } from '@/lib/validations/goalSchema';
import { updateGoal } from '@/lib/actions/goals';
import { createClient } from '@/lib/supabase/client';

const THRUST_AREAS = ['Technical Excellence', 'Quality', 'Delivery', 'People', 'Innovation', 'Customer Focus', 'Operational', 'Strategic'];
const UOM_OPTIONS = [
  { value: 'numeric', label: 'Numeric (Higher is better)' },
  { value: 'percentage', label: 'Percentage (Higher is better)' },
  { value: 'timeline', label: 'Timeline (Lower is better)' },
  { value: 'zero_based', label: 'Zero-based (Zero = 100%)' },
];

export default function EditGoalPage() {
  const router = useRouter();
  const params = useParams();
  const goalId = params.id as string;
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isShared, setIsShared] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: '', description: '', thrust_area: '',
      uom_type: 'numeric', target_value: 0, weightage: 10,
      is_shared_goal: false,
    }
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('goals').select('*').eq('id', goalId).single();
        if (error) throw error;
        if (data) {
          reset({
            title: data.title, description: data.description,
            thrust_area: data.thrust_area, uom_type: data.uom_type as any,
            target_value: Number(data.target_value), weightage: data.weightage,
            is_shared_goal: data.is_shared_goal,
          });
          setIsShared(data.is_shared_goal);
        }
      } catch (err: any) {
        console.error('Error fetching goal:', err);
        enqueueSnackbar(err.message || 'Failed to load goal data', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [goalId, reset, enqueueSnackbar]);

  const onSubmit = async (values: GoalFormValues) => {
    setSaving(true);
    try {
      await updateGoal(goalId, values);
      enqueueSnackbar('Goal updated successfully! ✨', { variant: 'success' });
      router.refresh();
      router.push('/employee/goals');
    } catch (err: any) {
      enqueueSnackbar(err.message, { variant: 'error' });
    }
    setSaving(false);
  };

  if (loading) return <LoadingScreen />;

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => router.push('/employee/goals')} sx={{ mb: 2, color: 'text.secondary' }}>Back</Button>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Edit Goal</Typography>
      <Card sx={{ maxWidth: 720 }}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <Controller name="title" control={control} render={({ field }) => (
                <TextField {...field} label="Goal Title" fullWidth disabled={isShared} error={!!errors.title} helperText={errors.title?.message} />
              )} />
              <Controller name="description" control={control} render={({ field }) => (
                <TextField {...field} label="Description" fullWidth multiline rows={3} disabled={isShared} error={!!errors.description} helperText={errors.description?.message} />
              )} />
              <Controller name="thrust_area" control={control} render={({ field }) => (
                <FormControl fullWidth error={!!errors.thrust_area} disabled={isShared}>
                  <InputLabel>Thrust Area</InputLabel>
                  <Select {...field} label="Thrust Area">
                    {THRUST_AREAS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </Select>
                </FormControl>
              )} />
              <Controller name="uom_type" control={control} render={({ field }) => (
                <FormControl fullWidth disabled={isShared}>
                  <InputLabel>Unit of Measurement</InputLabel>
                  <Select {...field} label="Unit of Measurement">
                    {UOM_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                  </Select>
                </FormControl>
              )} />
              <Stack direction="row" spacing={2}>
                <Controller name="target_value" control={control} render={({ field }) => (
                  <TextField {...field} label="Target" type="number" fullWidth disabled={isShared}
                    onChange={e => field.onChange(Number(e.target.value))} error={!!errors.target_value} helperText={errors.target_value?.message} />
                )} />
                <Controller name="weightage" control={control} render={({ field }) => (
                  <TextField {...field} label="Weightage (%)" type="number" fullWidth
                    onChange={e => field.onChange(Number(e.target.value))} error={!!errors.weightage}
                    helperText={errors.weightage?.message || 'Min 10%'} slotProps={{ input: { min: 10, max: 100, step: 5 } }} />
                )} />
              </Stack>
              <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', pt: 2 }}>
                <Button variant="outlined" onClick={() => router.push('/employee/goals')}>Cancel</Button>
                <Button type="submit" variant="contained" startIcon={<Save />} disabled={saving}>
                  {saving ? 'Saving...' : 'Update Goal'}
                </Button>
              </Stack>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
