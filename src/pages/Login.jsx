import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Link as MLink,
  Paper,
  Stack,
  TextField,
  Typography,
  Grid,
} from "@mui/material";
import { login as loginApi } from "../api/endpoints";
import { useAuth } from "../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

const schema = z.object({
  employee_id: z.string().min(1, "Employee ID is required"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });
  const { login } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const onSubmit = async (values) => {
    try {
      const res = await loginApi(values);
      if (res?.token) {
        login(res.token);
        enqueueSnackbar("Logged in", { variant: "success" });
        navigate("/");
      }
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.error || "Login failed", {
        variant: "error",
      });
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
      <Box sx={{ width: "100%", maxWidth: 880 }}>
        <Paper
          elevation={4}
          sx={{
            p: { xs: 2, md: 4 },
            mx: "auto",
            display: "grid",
            gridTemplateColumns: { md: "1fr 1fr" },
            gap: 3,
            borderRadius: 3,
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            maxHeight: {
              xs: "calc(100vh - 56px - 32px)",
              md: "calc(100vh - 64px - 32px)",
            },
            overflow: "auto",
          }}
        >
          {/* Left Welcome Section */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              flexDirection: "column",
              justifyContent: "center",
              color: "common.white",
              borderRadius: 2,
              p: 4,
              backgroundImage: `url("/pexels-mastercowley-713297.jpg")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Overlay for better text visibility */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: "rgba(0,0,0,0.5)", // dark overlay
              }}
            />

            {/* Text content */}
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Typography variant="h4" fontWeight={800} gutterBottom>
                Welcome back
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Log in to manage housekeeping requests, assignments and status
                updates.
              </Typography>
            </Box>
          </Box>

          {/* Right Login Form */}
          <Box>
            <Typography variant="h5" gutterBottom>
              Sign in
            </Typography>
            <Stack
              spacing={2}
              component="form"
              onSubmit={handleSubmit(onSubmit)}
            >
              <TextField
                label="Employee ID"
                {...register("employee_id", {
                  required: "Employee ID is required",
                })}
                error={!!errors.employee_id}
                helperText={errors.employee_id?.message}
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                {...register("password", {
                  required: "Password is required",
                })}
                error={!!errors.password}
                helperText={errors.password?.message}
                fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                fullWidth
                sx={{
                  backgroundColor: "#6a732c",
                  "&:hover": {
                    backgroundColor: "#6a732c",
                  },
                  color: "white",
                  boxShadow: "none",
                  "&:active": {
                    boxShadow: "none",
                  },
                }}
              >
                Login
              </Button>
              <Typography variant="body2">
                Forgot password?{" "}
                <MLink
                  component={Link}
                  to="/forgot"
                  sx={{
                    color: "#2563EB",
                    textDecoration: "underline",
                    "&:hover": {
                      color: "#1E40AF",
                      textDecoration: "underline",
                    },
                    "&:focus, &.Mui-focusVisible": { outline: "none" },
                  }}
                >
                  Reset via OTP
                </MLink>
              </Typography>
              <Typography variant="body2">
                New here?{" "}
                <MLink
                  component={Link}
                  to="/signup"
                  sx={{
                    color: "#2563EB",
                    textDecoration: "underline",
                    "&:hover": {
                      color: "#1E40AF",
                      textDecoration: "underline",
                    },
                    "&:focus, &.Mui-focusVisible": { outline: "none" },
                  }}
                >
                  Create an account
                </MLink>
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
