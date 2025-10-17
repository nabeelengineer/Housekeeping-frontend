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
import MenuIcon from "@mui/icons-material/Menu";
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

function MobileUserMenu({ role, onLogout, unreadCount }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const { pathname } = useLocation();
  const profileTarget = pathname === "/profile" ? "/" : "/profile";
  const profileLabel = pathname === "/profile" ? "Dashboard" : "Profile";
  return (
    <>
      <IconButton
        color="inherit"
        aria-label="menu"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        size="large"
        sx={{ ml: 1 }}
      >
        <MenuIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {role === "admin" ? (
          <MenuItem component={Link} to="/admin" onClick={() => setAnchorEl(null)}>
            <ListItemText>Admin</ListItemText>
          </MenuItem>
        ) : (
          <>
            <MenuItem component={Link} to="/buy-sell" onClick={() => setAnchorEl(null)}>
              <ListItemText>Buy/Sell</ListItemText>
            </MenuItem>
            <MenuItem component={Link} to="/vehicle-rental" onClick={() => setAnchorEl(null)}>
              <ListItemText>Vehicles</ListItemText>
            </MenuItem>
            <MenuItem component={Link} to="/my-assets" onClick={() => setAnchorEl(null)}>
              <ListItemText>My Assets</ListItemText>
            </MenuItem>
            <MenuItem component={Link} to={profileTarget} onClick={() => setAnchorEl(null)}>
              <ListItemText>{profileLabel}</ListItemText>
            </MenuItem>
          </>
        )}
        <MenuItem onClick={() => { setAnchorEl(null); onLogout(); }}>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

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
          <>
            <Stack direction="row" spacing={2} sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <Button color="inherit" component={Link} to="/login">Login</Button>
              <Button color="inherit" component={Link} to="/signup">Signup</Button>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ display: { xs: 'flex', sm: 'none' } }}>
              <Button color="inherit" component={Link} to="/login" size="small">Login</Button>
            </Stack>
          </>
        ) : (
          <>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ display: { xs: 'none', sm: 'flex' } }}>
              {role === "admin" ? (
                <Button color="inherit" component={Link} to="/admin">Admin</Button>
              ) : (
                <>
                  <Button color="inherit" component={Link} to="/buy-sell">Buy/Sell</Button>
                  <Button color="inherit" component={Link} to="/vehicle-rental">Vehicles</Button>
                  {(role === "it_admin" || role === "admin") && (
                    <>
                      <Button color="inherit" component={Link} to="/it/assets">IT Assets</Button>
                      <Button color="inherit" component={Link} to="/it/assignments">IT Assignments</Button>
                    </>
                  )}
                  <Button color="inherit" component={Link} to="/my-assets">My Assets</Button>
                  <Button color="inherit" component={Link} to={pathname === "/profile" ? "/" : "/profile"}>
                    {pathname === "/profile" ? "Dashboard" : "Profile"}
                  </Button>
                </>
              )}
              <Tooltip title="Notifications">
                <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
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
                  <MenuItem key={n.id} dense onClick={() => markRead.mutate(n.id)}>
                    <ListItemText primary={n.message} secondary={new Date(n.created_at).toLocaleString()} />
                  </MenuItem>
                ))}
                {(!notifications || notifications.length === 0) && (
                  <MenuItem disabled> No notifications </MenuItem>
                )}
              </Menu>
              <Button color="inherit" onClick={logout}>Logout</Button>
            </Stack>

            {/* Mobile hamburger */}
            <Box sx={{ display: { xs: 'flex', sm: 'none' } }}>
              <MobileUserMenu role={role} onLogout={logout} unreadCount={unread.length} />
            </Box>
          </>
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
