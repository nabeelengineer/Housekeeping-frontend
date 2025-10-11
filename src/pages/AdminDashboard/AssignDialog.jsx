import React from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from '@mui/material'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { assignRequest, listEmployees } from '../../api/endpoints'
import { useQuery } from '@tanstack/react-query'

const schema = z.object({ staff_id: z.string().min(1, 'Staff id is required') })

export default function AssignDialog({ open, onClose, requestId, onAssigned }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })
  const { data: employees = [] } = useQuery({ queryKey: ['employees'], queryFn: listEmployees })
  const staff = (employees || []).filter(e => e.role === 'staff')

  const onSubmit = async (values) => {
    try {
      await assignRequest(requestId, values)
      onAssigned?.()
      onClose()
    } catch (e) {
      alert(e?.response?.data?.message || e?.response?.data?.error || 'Failed to assign')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Assign Request</DialogTitle>
      <DialogContent>
        <TextField
          select
          fullWidth
          label="Assign To (Staff)"
          size="small"
          sx={{ mt: 2 }}
          defaultValue=""
          {...register('staff_id')}
          error={!!errors.staff_id}
          helperText={errors.staff_id?.message || 'Select a staff member'}
        >
          {staff.map(s => (
            <MenuItem key={s.employee_id} value={s.employee_id}>
              {s.name || s.employee_id} ({s.employee_id}){s.department_id ? ` • ${s.department_id}` : ''}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={isSubmitting}>Assign</Button>
      </DialogActions>
    </Dialog>
  )
}
