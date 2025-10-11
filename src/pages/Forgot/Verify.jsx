import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { verifyOtp } from '../../api/endpoints'
import { useSnackbar } from 'notistack'
import { useLocation, useNavigate } from 'react-router-dom'

const schema = z.object({
  phone_no: z.string().min(8, 'Phone is required'),
  otp_code: z.string().min(4, 'OTP is required'),
  new_password: z.string().min(6, 'Min 6 chars'),
  confirm_password: z.string().min(6, 'Min 6 chars'),
}).refine((d) => d.new_password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password']
})

export default function VerifyReset() {
  const { state } = useLocation()
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (state?.phone_no) setValue('phone_no', state.phone_no)
    if (state?.otp_code) setValue('otp_code', state.otp_code)
  }, [state, setValue])

  const onSubmit = async (values) => {
    try {
      await verifyOtp(values)
      enqueueSnackbar('Password updated. Please login.', { variant: 'success' })
      navigate('/login')
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.error || 'Failed to reset', { variant: 'error' })
    }
  }

  return (
    <Box maxWidth={420} mx="auto">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Verify OTP & Reset</Typography>
        <Stack spacing={2} component="form" onSubmit={handleSubmit(onSubmit)}>
          <TextField label="Phone" size="small" {...register('phone_no')} error={!!errors.phone_no} helperText={errors.phone_no?.message} />
          <TextField label="OTP" size="small" {...register('otp_code')} error={!!errors.otp_code} helperText={errors.otp_code?.message} />
          <TextField label="New Password" type="password" size="small" {...register('new_password')} error={!!errors.new_password} helperText={errors.new_password?.message} />
          <TextField label="Confirm Password" type="password" size="small" {...register('confirm_password')} error={!!errors.confirm_password} helperText={errors.confirm_password?.message} />
          <Button type="submit" variant="contained" disabled={isSubmitting}>Reset</Button>
        </Stack>
      </Paper>
    </Box>
  )
}
