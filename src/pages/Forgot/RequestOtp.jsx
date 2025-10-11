import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { requestOtp } from '../../api/endpoints'
import { useSnackbar } from 'notistack'
import { useNavigate } from 'react-router-dom'

const schema = z.object({ phone_no: z.string().min(8, 'Phone is required') })

export default function RequestOtp() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()

  const onSubmit = async (values) => {
    try {
      const res = await requestOtp(values)
      enqueueSnackbar('OTP sent (check API response in dev)', { variant: 'info' })
      // For dev, we pass otp via state if present
      navigate('/forgot/verify', { state: { phone_no: values.phone_no, otp_code: res?.otp } })
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.error || 'Failed to send OTP', { variant: 'error' })
    }
  }

  return (
    <Box maxWidth={420} mx="auto">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Forgot Password</Typography>
        <Typography variant="body2" gutterBottom>Enter your phone number to receive an OTP.</Typography>
        <Stack spacing={2} component="form" onSubmit={handleSubmit(onSubmit)}>
          <TextField label="Phone" size="small" {...register('phone_no')} error={!!errors.phone_no} helperText={errors.phone_no?.message} />
          <Button type="submit" variant="contained" disabled={isSubmitting}>Send OTP</Button>
        </Stack>
      </Paper>
    </Box>
  )
}
