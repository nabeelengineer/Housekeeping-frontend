import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listEmployees,
  createEmployee,
  setEmployeeRole,
  updateEmployee,
  deleteEmployee,
  listDepartments,
} from "../../api/endpoints";
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { MdDelete, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { RiEditLine } from "react-icons/ri";
import { DataGrid } from "@mui/x-data-grid";
import { useForm, Controller } from "react-hook-form";
import { useSnackbar } from "notistack";
import { useAuth } from "../../auth/AuthContext";
import Tooltip from "@mui/material/Tooltip";

export default function Employees() {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { employeeId } = useAuth();
  
  // State declarations
  const [open, setOpen] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [editId, setEditId] = React.useState("");
  const [confirmId, setConfirmId] = React.useState("");
  
  // Queries
  const { data = [], isLoading, error } = useQuery({ 
    queryKey: ["employees"], 
    queryFn: listEmployees 
  });
  
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: listDepartments,
  });

  // Form setup
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      employee_id: "",
      name: "",
      email: "",
      phone_no: "",
      department_id: "",
      password: "",
      role: "employee"
    }
  });

  // Reset form when dialog is opened/closed
  React.useEffect(() => {
    if (open) {
      reset({
        employee_id: "",
        name: "",
        email: "",
        phone_no: "",
        department_id: "",
        password: "",
        role: "employee"
      });
    }
  }, [open, reset]);
  
  const [editValues, setEditValues] = React.useState({
    name: "",
    email: "",
    phone_no: "",
    department_id: "",
    manager_id: "",
  });
  const createMut = useMutation({
    mutationFn: (data) => {
      return createEmployee(data);
    },
    onSuccess: () => {
      enqueueSnackbar("Employee created", { variant: "success" });
      qc.invalidateQueries({ queryKey: ["employees"] });
      reset();
      setOpen(false);
    },
    onError: (e) =>
      enqueueSnackbar(e?.response?.data?.error || "Failed to create", {
        variant: "error",
      }),
  });

  const updateMut = useMutation({
    mutationFn: ({ employee_id, values }) => {
      return updateEmployee(employee_id, values);
    },
    onSuccess: () => {
      enqueueSnackbar("Employee updated", { variant: "success" });
      qc.invalidateQueries({ queryKey: ["employees"] });
      setEditId("");
    },
    onError: (e) =>
      enqueueSnackbar(e?.response?.data?.error || "Failed to update", {
        variant: "error",
      }),
  });

  const deleteMut = useMutation({
    mutationFn: (employee_id) => deleteEmployee(employee_id),
    onSuccess: () => {
      enqueueSnackbar("Employee deleted", { variant: "success" });
      qc.invalidateQueries({ queryKey: ["employees"] });
      setConfirmId("");
    },
    onError: (e) =>
      enqueueSnackbar(e?.response?.data?.error || "Failed to delete", {
        variant: "error",
      }),
  });

  const roleMut = useMutation({
    mutationFn: ({ employee_id, role }) =>
      setEmployeeRole(employee_id, { role }),
    onSuccess: () => {
      enqueueSnackbar("Role updated", { variant: "success" });
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (e) => {
      const msg =
        e?.response?.status === 404
          ? "Endpoint not found (backend route missing)"
          : e?.response?.data?.error || "Failed to update role";
      enqueueSnackbar(msg, { variant: "error" });
    },
  });

  const [query, setQuery] = React.useState("");

  const filtered = (data || []).filter((e) => {
    if (!query) return true;
    const q = query.toLowerCase();
    const values = [
      e.employee_id,
      e.name,
      e.email,
      e.phone_no,
      e.department_id,
      e.role,
    ]
      .filter(Boolean)
      .map((v) => String(v).toLowerCase());
    return values.some((v) => v.includes(q));
  });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        minWidth: 0,
      }}
    >
      {/* Header tools (subtitle + actions) */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography
          variant="h5"
          color="text.secondary"
          sx={{ flexGrow: 1, ml: 2 }}
        >
          Manage employees
        </Typography>
        <TextField
          size="small"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ minWidth: 280 }}
        />
        <Button
          variant="contained"
          onClick={() => setOpen(true)}
          sx={{
            backgroundColor: 'primary.main',
            color: 'common.white',
            boxShadow: 'none',
            mr: 3,
          }}
        >
          Create
        </Button>
      </Box>

      {/* Dialog for creating a new employee */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Create Employee (Admin)</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            id="emp-form"
            onSubmit={handleSubmit(createMut.mutate)}
            sx={{ mt: 1 }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              <Controller
                name="employee_id"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="Employee ID"
                  />
                )}
              />
              <Controller
                name="name"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="Name"
                  />
                )}
              />
              <Controller
                name="phone_no"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="Phone"
                  />
                )}
              />
              <Controller
                name="email"
                control={control}
                rules={{ 
                  required: true,
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="Email"
                    type="email"
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
              <Controller
                name="password"
                control={control}
                rules={{ 
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters"
                  }
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    error={!!error}
                    helperText={error?.message}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                        </IconButton>
                      ),
                    }}
                  />
                )}
              />
              <Controller
                name="department_id"
                control={control}
                rules={{ required: "Department is required" }}
                render={({ field: { onChange, value }, fieldState: { error } }) => {
                  const selectedDept = departments.find(d => d.dept_id === value);
                  
                  return (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Department"
                      value={value || ""}
                      onChange={(e) => {
                        console.log('Department selected:', e.target.value);
                        onChange(e.target.value);
                      }}
                      error={!!error}
                      helperText={error?.message}
                      SelectProps={{
                        displayEmpty: false,
                        renderValue: () => {
                          if (!value || !selectedDept) return '';
                          return selectedDept.dept_name;
                        },
                        MenuProps: {
                          PaperProps: {
                            style: {
                              maxHeight: 250,
                            },
                          },
                        },
                      }}
                      inputProps={{ 'aria-label': 'Select department' }}
                    >
                      {departments.map((dept) => (
                        <MenuItem key={dept.dept_id} value={dept.dept_id}>
                          {dept.dept_name}
                        </MenuItem>
                      ))}
                    </TextField>
                  );
                }}
              />
              <Controller
                name="role"
                control={control}
                defaultValue="employee"
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    size="small"
                    label="Role"
                  >
                    <MenuItem value="employee">employee</MenuItem>
                    <MenuItem value="staff">staff</MenuItem>
                    <MenuItem value="it_admin">it_admin</MenuItem>
                    {/* <MenuItem value="admin">admin</MenuItem> */}
                  </TextField>
                )}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            type="submit"
            form="emp-form"
            variant="contained"
            disabled={createMut.isLoading}
            sx={{
              backgroundColor: 'primary.main',
              color: 'common.white',
              boxShadow: 'none',
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Display loading, error, or DataGrid */}
      {isLoading ? (
        <Typography>Loading...</Typography>
      ) : error ? (
        <Typography color="error">Failed to load employees</Typography>
      ) : (
        <Paper
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            minHeight: 0,
          }}
        >
          {/*
            This Box is crucial for handling the DataGrid's horizontal overflow.
            It allows the DataGrid to scroll horizontally within this Box,
            preventing it from causing the entire page/parent Paper to scroll.
          */}
          <Box
            sx={{
              flexGrow: 1,
              minHeight: 0,
              width: "100%",
              overflowX: "auto",
            }}
          >
            {" "}
            {/* Key change: overflowX: 'auto' */}
            <DataGrid
              rows={filtered.map((e) => ({ id: e.employee_id, ...e }))}
              columns={[
                { field: "employee_id", headerName: "Employee ID", width: 120 },
                { field: "name", headerName: "Name", flex: 1, minWidth: 140 },
                { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
                { field: "phone_no", headerName: "Phone", width: 120 },
                { field: "role", headerName: "Role", width: 120 },
                {
                  field: "department_id",
                  headerName: "Department",
                  width: 140,
                },
                {
                  field: "setRole",
                  headerName: "Set Role",
                  flex: 1,
                  minWidth: 150,
                  sortable: false,
                  filterable: false,
                  renderCell: (params) => {
                    const isAdminUser = params.row.role === "admin";
                    const isMe = params.row.employee_id === employeeId;
                    const disabled = isAdminUser || isMe;
                    const label = isAdminUser
                      ? "Admin role cannot be changed"
                      : isMe
                      ? "You cannot change your own role"
                      : "Change role";
                    return (
                      <Tooltip title={label} placement="top">
                        <span>
                          <TextField
                            select
                            size="small"
                            defaultValue={params.row.role}
                            disabled={disabled}
                            onChange={(e) =>
                              roleMut.mutate({
                                employee_id: params.row.employee_id,
                                role: e.target.value,
                              })
                            }
                          >
                            <MenuItem value="employee">employee</MenuItem>
                            <MenuItem value="staff">staff</MenuItem>
                            <MenuItem value="it_admin">it_admin</MenuItem>
                            <MenuItem value="admin">admin</MenuItem>
                          </TextField>
                        </span>
                      </Tooltip>
                    );
                  },
                },
                {
                  field: "actions",
                  headerName: "Actions",
                  width: 150,
                  sortable: false,
                  filterable: false,
                  renderCell: (params) => {
                    const isMe = params.row.employee_id === employeeId;
                    const isAdminUser = params.row.role === "admin";
                    return (
                      <Box display="flex" gap={3}>
                        <IconButton
                          size="small"
                          aria-label="edit"
                          onClick={() => {
                            setEditId(params.row.employee_id);
                            setEditValues({
                              name: params.row.name || "",
                              email: params.row.email || "",
                              phone_no: params.row.phone_no || "",
                              department_id: params.row.department_id || "",
                              manager_id: params.row.manager_id || "",
                            });
                          }}
                        >
                          <RiEditLine />
                        </IconButton>
                        <Tooltip
                          title={
                            isAdminUser
                              ? "Cannot delete admin"
                              : isMe
                              ? "You cannot delete your own account"
                              : "Delete"
                          }
                        >
                          <span>
                            <IconButton
                              size="small"
                              aria-label="delete"
                              color="error"
                              disabled={isAdminUser || isMe}
                              onClick={() =>
                                setConfirmId(params.row.employee_id)
                              }
                            >
                              <MdDelete />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    );
                  },
                },
              ]}
              pageSizeOptions={[5, 10, 25]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              sx={{ height: "100%" }} // DataGrid takes full height of its parent
            />
          </Box>
        </Paper>
      )}
      {/* Edit Employee dialog */}
      <Dialog
        open={!!editId}
        onClose={() => setEditId("")}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Employee</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            id="emp-edit-form"
            onSubmit={(e) => {
              e.preventDefault();
              updateMut.mutate({ employee_id: editId, values: editValues });
            }}
            sx={{ mt: 1 }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                size="small"
                label="Name"
                value={editValues.name}
                onChange={(e) =>
                  setEditValues((v) => ({ ...v, name: e.target.value }))
                }
              />
              <TextField
                fullWidth
                size="small"
                label="Email"
                type="email"
                value={editValues.email}
                onChange={(e) =>
                  setEditValues((v) => ({ ...v, email: e.target.value }))
                }
              />
              <TextField
                fullWidth
                size="small"
                label="Phone"
                value={editValues.phone_no}
                onChange={(e) =>
                  setEditValues((v) => ({ ...v, phone_no: e.target.value }))
                }
              />
              <TextField
                fullWidth
                size="small"
                label="Department ID"
                value={editValues.department_id}
                onChange={(e) =>
                  setEditValues((v) => ({
                    ...v,
                    department_id: e.target.value,
                  }))
                }
              />
              <TextField
                fullWidth
                size="small"
                label="Manager ID"
                value={editValues.manager_id}
                onChange={(e) =>
                  setEditValues((v) => ({ ...v, manager_id: e.target.value }))
                }
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditId("")}>Cancel</Button>
          <Button
            type="submit"
            form="emp-edit-form"
            variant="contained"
            disabled={updateMut.isLoading}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        open={!!confirmId}
        onClose={() => setConfirmId("")}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Delete Employee</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete employee {confirmId}? This cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmId("")}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => deleteMut.mutate(confirmId)}
            disabled={deleteMut.isLoading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
