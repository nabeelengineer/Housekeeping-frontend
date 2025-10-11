import React from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from '@mui/material'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateStatus } from '../../api/endpoints'

const schema = z.object({ status: z.enum(['pending','in_progress','closed']) })

export default function UpdateStatusDialog({ open, onClose, requestId, currentStatus, onUpdated }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema), defaultValues: { status: currentStatus || 'pending' } })

  const onSubmit = async (values) => {
    try {
      await updateStatus(requestId, values)
      onUpdated?.()
      onClose()
    } catch (e) {
      alert(e?.response?.data?.message || e?.response?.data?.error || 'Failed to update status')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Update Status</DialogTitle>
      <DialogContent>
        <TextField select fullWidth label="Status" sx={{ mt: 2 }} defaultValue={currentStatus || 'pending'} {...register('status')} error={!!errors.status} helperText={errors.status?.message}>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="in_progress">In Progress</MenuItem>
          <MenuItem value="closed">Closed</MenuItem>
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={isSubmitting}>Update</Button>
      </DialogActions>
    </Dialog>
  )
}
