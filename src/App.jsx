import React from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Stack,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemText,
  Tooltip,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listNotifications, readNotification } from "./api/endpoints";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import EmployeeDashboard from "./pages/EmployeeDashboard/index.jsx";
import AdminDashboard from "./pages/AdminDashboard/index.jsx";
import ITLogs from "./pages/Admin/ITLogs.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import RequestOtp from "./pages/Forgot/RequestOtp.jsx";
import VerifyReset from "./pages/Forgot/Verify.jsx";
import Departments from "./pages/AdminDashboard/Departments.jsx";
import Categories from "./pages/AdminDashboard/Categories.jsx";
import Employees from "./pages/AdminDashboard/Employees.jsx";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import { useAuth } from "./auth/AuthContext.jsx";
import Profile from "./pages/Profile.jsx";
import BuySellList from "./pages/BuySell/BuySellList.jsx";
import ProductDetail from "./pages/BuySell/ProductDetail.jsx";
import VehicleList from "./pages/VehicleRental/VehicleList.jsx";
import BuySellModeration from "./pages/Admin/BuySellModeration.jsx";
import VehicleRentalLogs from "./pages/Admin/VehicleRentalLogs.jsx";
import VehiclesAdmin from "./pages/Admin/Vehicles.jsx";
import ITAssets from "./pages/IT/Assets.jsx";
import ITAssignments from "./pages/IT/Assignments.jsx";
import MyAssets from "./pages/Employee/MyAssets.jsx";

function NavBar() {
  const { token, role, logout } = useAuth();
  const qc = useQueryClient();
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: listNotifications,
    enabled: !!token,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  const unread = (notifications || []).filter((n) => !n.read);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const markRead = useMutation({
    mutationFn: (id) => readNotification(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const { pathname } = useLocation();
  const authPaths = ["/login", "/signup", "/forgot", "/forgot/verify"];
  if (pathname.startsWith("/admin") || authPaths.includes(pathname)) return null;
  return (
    <AppBar position="static" square sx={{ borderRadius: 0 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Make IT EEz
        </Typography>

        {!token ? (
          <Stack direction="row" spacing={2}>
            <Button
              color="inherit"
              component={Link}
              to="/login"
              sx={{
                textDecoration: "none",
                color: "common.white",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.08)",
                  color: "common.white",
                },
                "&:focus, &.Mui-focusVisible": {
                  outline: "none",
                  boxShadow: "none",
                },
              }}
              disableRipple
              disableFocusRipple
              focusVisibleClassName="Mui-focusVisible-none"
            >
              Login
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/signup"
              sx={{
                textDecoration: "none",
                color: "common.white",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.08)",
                  color: "common.white",
                },
                "&:focus, &.Mui-focusVisible": {
                  outline: "none",
                  boxShadow: "none",
                },
              }}
              disableRipple
              disableFocusRipple
              focusVisibleClassName="Mui-focusVisible-none"
            >
              Signup
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={2} alignItems="center">
            {role === "admin" ? (
              <Button
                color="inherit"
                component={Link}
                to="/admin"
                sx={{
                  textDecoration: "none",
                  color: "common.white",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.08)",
                    color: "common.white",
                  },
                  "&:focus, &.Mui-focusVisible": {
                    outline: "none",
                    boxShadow: "none",
                  },
                }}
                disableRipple
                disableFocusRipple
              >
                Admin
              </Button>
            ) : (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  to="/buy-sell"
                  sx={{
                    textDecoration: "none",
                    color: "common.white",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.08)",
                      color: "common.white",
                    },
                    "&:focus, &.Mui-focusVisible": {
                      outline: "none",
                      boxShadow: "none",
                    },
                  }}
                >
                  Buy/Sell
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/vehicle-rental"
                  sx={{
                    textDecoration: "none",
                    color: "common.white",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.08)",
                      color: "common.white",
                    },
                    "&:focus, &.Mui-focusVisible": {
                      outline: "none",
                      boxShadow: "none",
                    },
                  }}
                >
                  Vehicles
                </Button>
                {(role === "it_admin" || role === "admin") && (
                  <>
                    <Button
                      color="inherit"
                      component={Link}
                      to="/it/assets"
                      sx={{
                        textDecoration: "none",
                        color: "common.white",
                        "&:hover": {
                          bgcolor: "rgba(255,255,255,0.08)",
                          color: "common.white",
                        },
                        "&:focus, &.Mui-focusVisible": {
                          outline: "none",
                          boxShadow: "none",
                        },
                      }}
                      disableRipple
                      disableFocusRipple
                    >
                      IT Assets
                    </Button>
                    <Button
                      color="inherit"
                      component={Link}
                      to="/it/assignments"
                      sx={{
                        textDecoration: "none",
                        color: "common.white",
                        "&:hover": {
                          bgcolor: "rgba(255,255,255,0.08)",
                          color: "common.white",
                        },
                        "&:focus, &.Mui-focusVisible": {
                          outline: "none",
                          boxShadow: "none",
                        },
                      }}
                      disableRipple
                      disableFocusRipple
                    >
                      IT Assignments
                    </Button>
                  </>
                )}
                <Button
                  color="inherit"
                  component={Link}
                  to="/my-assets"
                  sx={{
                    textDecoration: "none",
                    color: "common.white",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.08)",
                      color: "common.white",
                    },
                    "&:focus, &.Mui-focusVisible": {
                      outline: "none",
                      boxShadow: "none",
                    },
                  }}
                  disableRipple
                  disableFocusRipple
                >
                  My Assets
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to={pathname === "/profile" ? "/" : "/profile"}
                  sx={{
                    textDecoration: "none",
                    color: "common.white",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.08)",
                      color: "common.white",
                    },
                    "&:focus, &.Mui-focusVisible": {
                      outline: "none",
                      boxShadow: "none",
                    },
                  }}
                >
                  {pathname === "/profile" ? "Dashboard" : "Profile"}
                </Button>
              </>
            )}
            {!!token && (
              <>
                <Tooltip title="Notifications">
                  <IconButton
                    color="inherit"
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    sx={{
                      "&:focus": { outline: "none", boxShadow: "none" },
                    }}
                  >
                    <Badge badgeContent={unread.length} color="error">
                      <NotificationsNoneIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={() => setAnchorEl(null)}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  {(notifications || []).slice(0, 10).map((n) => (
                    <MenuItem
                      key={n.id}
                      dense
                      onClick={() => markRead.mutate(n.id)}
                      sx={{
                        opacity: n.read ? 0.65 : 1,
                        alignItems: "flex-start",
                        whiteSpace: "normal",
                        maxWidth: 360,
                      }}
                    >
                      <ListItemText
                        primary={n.message}
                        secondary={new Date(n.created_at).toLocaleString()}
                      />
                    </MenuItem>
                  ))}
                  {(!notifications || notifications.length === 0) && (
                    <MenuItem disabled> No notifications </MenuItem>
                  )}
                </Menu>
              </>
            )}
            <Button
              color="inherit"
              onClick={logout}
              sx={{
                textDecoration: "none",
                color: "common.white",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.08)",
                  color: "common.white",
                },
                "&:focus, &.Mui-focusVisible": {
                  outline: "none",
                  boxShadow: "none",
                },
              }}
            >
              Logout
            </Button>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default function App() {
  const { role } = useAuth();
  const location = useLocation();
  const noContainerPaths = ["/login", "/signup", "/forgot", "/forgot/verify"];
  const isAdmin = location.pathname.startsWith("/admin");
  const useFullWidth = noContainerPaths.includes(location.pathname);

  const routes = (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot" element={<RequestOtp />} />
      <Route path="/forgot/verify" element={<VerifyReset />} />
      {/* Profile page for non-admin users */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute roles={["employee", "staff", "it_admin"]}>
            <Profile />
          </ProtectedRoute>
        }
      />
      {/* Buy/Sell Module */}
      <Route
        path="/buy-sell"
        element={
          <ProtectedRoute roles={["employee", "staff", "admin", "it_admin"]}>
            <BuySellList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buy-sell/:id"
        element={
          <ProtectedRoute roles={["employee", "staff", "admin"]}>
            <ProductDetail />
          </ProtectedRoute>
        }
      />
      {/* Vehicle Rental Module */}
      <Route
        path="/vehicle-rental"
        element={
          <ProtectedRoute roles={["employee", "staff", "admin", "it_admin"]}>
            <VehicleList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute roles={["employee", "staff", "admin", "it_admin"]}>
            {role === "admin" ? (
              <Navigate to="/admin" replace />
            ) : (
              <EmployeeDashboard />
            )}
          </ProtectedRoute>
        }
      />
      {/* IT Admin module */}
      <Route
        path="/it/assets"
        element={
          <ProtectedRoute roles={["it_admin", "admin"]}>
            <ITAssets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/it/assignments"
        element={
          <ProtectedRoute roles={["it_admin", "admin"]}>
            <ITAssignments />
          </ProtectedRoute>
        }
      />
      {/* Employee read-only assets view */}
      <Route
        path="/my-assets"
        element={
          <ProtectedRoute roles={["employee", "staff", "it_admin", "admin"]}>
            <MyAssets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="departments" element={<Departments />} />
        <Route path="categories" element={<Categories />} />
        <Route path="employees" element={<Employees />} />
        <Route path="market/moderation" element={<BuySellModeration />} />
        <Route path="vehicles" element={<VehiclesAdmin />} />
        <Route path="vehicle/logs" element={<VehicleRentalLogs />} />
        <Route path="it/logs" element={<ITLogs />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  return (
    <Box>
      <NavBar />
      {isAdmin ? (
        <Box sx={{ mt: 0 }}>{routes}</Box>
      ) : useFullWidth ? (
        <Box sx={{ mt: 0, borderRadius: 0 }}>{routes}</Box>
      ) : (
        <Container sx={{ mt: 3 }}>{routes}</Container>
      )}
    </Box>
  );
}
