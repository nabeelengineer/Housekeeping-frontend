import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  Grid,
} from "@mui/material";
import { signup as signupApi, listDepartments } from "../api/endpoints";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const schema = z
  .object({
    employee_id: z.string().min(1, "Employee ID is required"),
    name: z.string().min(1, "Name is required"),
    phone_no: z.string().min(10, "Phone is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Min 6 chars"),
    confirm_password: z.string().min(8, "Min 6 chars"),
    department_id: z.string().min(1, "Department is required"),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export default function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });
  const navigate = useNavigate();
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: listDepartments,
  });

  const onSubmit = async (values) => {
    try {
      await signupApi(values);
      alert("Registered successfully. Please login.");
      navigate("/login");
    } catch (e) {
      alert(e?.response?.data?.error || "Signup failed");
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: { xs: 56, md: 64 },
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.50",
        px: 2,
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      <Grid container alignItems="center" justifyContent="center">
        <Grid item xs={11} sm={8} md={6} lg={5}>
          <Paper
            elevation={3}
            sx={{
              p: { xs: 2, md: 4 },
              display: "grid",
              gridTemplateColumns: { md: "1.3fr 1fr" },
              gap: 3,
              mt: 0,
              maxHeight: {
                xs: "calc(100vh - 56px - 32px)",
                md: "calc(100vh - 64px - 32px)",
              },
              overflow: "auto",
            }}
          >
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                flexDirection: "column",
                justifyContent: "center",
                color: "common.white",
                borderRadius: 2,
                p: 4,
                backgroundImage: `url("/pexels-ron-lach-10557498.jpg")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Overlay for better readability */}
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  bgcolor: "rgba(0,0,0,0.5)",
                }}
              />

              {/* Text content */}
              <Box sx={{ position: "relative", zIndex: 1 }}>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                  Join us
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Create your account to raise requests and track progress
                  easily.
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="h5" gutterBottom>
                Create account
              </Typography>
              <Stack
                spacing={2}
                component="form"
                onSubmit={handleSubmit(onSubmit)}
              >
                <TextField
                  label="Employee ID"
                  {...register("employee_id")}
                  error={!!errors.employee_id}
                  helperText={errors.employee_id?.message}
                  fullWidth
                />
                <TextField
                  label="Name"
                  {...register("name")}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  fullWidth
                />
                <TextField
                  label="Phone"
                  {...register("phone_no")}
                  error={!!errors.phone_no}
                  helperText={errors.phone_no?.message}
                  fullWidth
                />
                <TextField
                  label="Email"
                  {...register("email")}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  fullWidth
                />
                <TextField
                  select
                  label="Department"
                  defaultValue=""
                  {...register("department_id")}
                  error={!!errors.department_id}
                  helperText={errors.department_id?.message}
                  fullWidth
                >
                  <MenuItem value="" disabled>
                    Select department
                  </MenuItem>
                  {departments.map((d) => (
                    <MenuItem key={d.dept_id} value={d.dept_id}>
                      {d.dept_name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Password"
                  type="password"
                  {...register("password")}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  fullWidth
                />
                <TextField
                  label="Confirm Password"
                  type="password"
                  {...register("confirm_password")}
                  error={!!errors.confirm_password}
                  helperText={errors.confirm_password?.message}
                  fullWidth
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  fullWidth
                >
                  Create account
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
