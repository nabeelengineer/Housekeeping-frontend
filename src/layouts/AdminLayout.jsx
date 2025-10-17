import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  IconButton,
  Divider,
  Avatar,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  Button,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import EmailIcon from "@mui/icons-material/Email";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../api/endpoints";


const drawerWidth = 260;

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { pathname } = useLocation();
  const { employeeId, role, logout, token } = useAuth();
  const { data: me } = useQuery({
    queryKey: ["me", employeeId],
    queryFn: getMe,
    staleTime: 0,
    enabled: !!token,
  });
  const nav = [
    { label: "Dashboard", to: "/admin" },
    { label: "Departments", to: "/admin/departments" },
    { label: "Categories", to: "/admin/categories" },
    { label: "Employees", to: "/admin/employees" },
    { label: "Market Moderation", to: "/admin/market/moderation" },
    { label: "Vehicles", to: "/admin/vehicles" },
    { label: "Vehicle Logs", to: "/admin/vehicle/logs" },
    { label: "IT Logs", to: "/admin/it/logs" },
  ];
  const displayName = me?.name || "Admin";
  const displayEmail = me?.email || "";
  const displayEmpId = me?.employee_id || employeeId;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // Derive page title from current route
  const pageTitle = React.useMemo(() => {
    // Prefer the longest matching route prefix
    const match = [...nav]
      .sort((a, b) => b.to.length - a.to.length)
      .find((n) => pathname === n.to || pathname.startsWith(n.to + "/"));
    if (match) return match.label;
    if (pathname === "/admin") return "Dashboard";
    const last = pathname.split("/").filter(Boolean).pop();
    if (!last) return "Dashboard";
    // Fallback: prettify last segment
    return last.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }, [pathname]);

  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        width: "80%",
      }}
    >
      <Toolbar
        sx={{
          px: 2,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
          position: 'relative',
        }}
      >
        <Box
          component="img"
          src="/make it easy White-01.png"
          sx={{ width: 140, height: 'auto', objectFit: 'contain', display: 'block', mt: 2 }}
        />
        {/* Close inside drawer on mobile */}
        <IconButton
          aria-label="close sidebar"
          color="inherit"
          onClick={() => setMobileOpen(false)}
          sx={{
            display: { xs: 'inline-flex', sm: 'none' },
            position: 'absolute',
            top: 25,
            right: -40,
            backgroundColor: 'rgba(255,255,255,0.2)',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Toolbar>
      <List
        sx={{
          flexGrow: 1,
          flexDirection: "column",
          gap: 0.5,
          mt: 1,
        }}
      >
        {nav.map((item) => (
          <ListItemButton
            key={item.to}
            component={RouterLink}
            to={item.to}
            selected={pathname === item.to}
            sx={{
              py: 1,
              borderRadius: 2,
              color: "#fff",
              "& .MuiListItemText-primary": { color: "#fff" },
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "#fff",
                "& .MuiListItemText-primary": { color: "#fff" },
              },
              "&.Mui-selected": {
                backgroundColor: "rgba(255,255,255,0.16)",
                color: "#fff",
                "& .MuiListItemText-primary": { color: "#fff" },
                "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
              },
            }}
          >
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
        {/* Logout removed from drawer */}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", width: "100%" }}>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              pl: 2,
              backgroundColor: "#D32F2F",
              color: "#fff",
              borderRadius: 0,
            },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              pl: 2,
              backgroundColor: "#D32F2F",
              color: "#fff",
              borderRadius: 0,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pr: { xs: 1.5, sm: 3 },
          pb: 3,
          pl: { xs: 1.5, sm: 3 },
          pt: 0,
          marginLeft: "0px",
        }}
      >
        <Box
          sx={{ maxWidth: { xs: "100%", md: 1000 }, mx: "auto", width: "100%" }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: { xs: 1.5, sm: 3 },
              mb: { xs: 1.5, sm: 3 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {/* Left hamburger on mobile */}
              <IconButton
                color="inherit"
                onClick={() => setMobileOpen(!mobileOpen)}
                sx={{ display: { xs: "inline-flex", sm: "none" } }}
                aria-label="open sidebar"
              >
                <MenuIcon />
              </IconButton>
              <Typography
                component="h1"
                fontWeight={800}
                sx={{ fontSize: { xs: 22, sm: 28, md: 32 } }}
              >
                {pageTitle}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Button
                  variant="h5"
                  color="text.secondary"
                  onClick={handleMenuOpen}
                  endIcon={open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  aria-haspopup="true"
                  aria-controls={open ? "admin-profile-menu" : undefined}
                  aria-expanded={open ? "true" : undefined}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    border: "none",
                    outline: "none",
                    boxShadow: "none",
                    "&:focus": { outline: "none" },
                    "&:hover": { backgroundColor: "transparent" },
                    flexGrow: 1,
                    ml: 2,
                  }}
                >
                  Hi, {displayName}
                </Button>
                {/* Same menu is used for mobile trigger below */}
                <Menu
                  id="admin-profile-menu"
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  slotProps={{
                    paper: { sx: { minWidth: 300, maxWidth: 500 } },
                  }}
                >
                  <Box sx={{ px: 2, pt: 1, pb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      User Profile
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 1,
                      }}
                    >
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {(displayName || "U").slice(0, 1)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>
                          {displayName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {displayEmpId}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <MenuItem disabled>
                    <ListItemIcon>
                      <EmailIcon fontSize="small" />
                    </ListItemIcon>
                    {displayEmail || "—"}
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      logout();
                    }}
                    sx={{ color: "error.main" }}
                  >
                    <ListItemIcon>
                      <LogoutIcon
                        fontSize="small"
                        sx={{ color: "error.main" }}
                      />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </Box>
              {/* Compact account trigger on xs */}
              <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                <IconButton aria-label="account menu" onClick={handleMenuOpen}>
                  <Avatar sx={{ width: 28, height: 28 }}>
                    {(displayName || 'U').slice(0,1)}
                  </Avatar>
                </IconButton>
              </Box>
            </Box>
          </Box>

          {/* Content */}
          <Paper
            sx={{ p: { xs: 1.5, md: 3 }, borderRadius: 3, overflowX: "auto" }}
            elevation={1}
          >
            <Outlet />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
