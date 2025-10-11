import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listEmployees,
  createEmployee,
  setEmployeeRole,
  updateEmployee,
  deleteEmployee,
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
import { MdDelete } from "react-icons/md";
import { RiEditLine } from "react-icons/ri";
import { DataGrid } from "@mui/x-data-grid";
import { useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import { useAuth } from "../../auth/AuthContext";
import Tooltip from "@mui/material/Tooltip";

export default function Employees() {
  const qc = useQueryClient();
  const {
    data = [],
    isLoading,
    error,
  } = useQuery({ queryKey: ["employees"], queryFn: listEmployees });
  const { register, handleSubmit, reset } = useForm();
  const { enqueueSnackbar } = useSnackbar();
  const { employeeId } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [editId, setEditId] = React.useState("");
  const [editValues, setEditValues] = React.useState({
    name: "",
    email: "",
    phone_no: "",
    department_id: "",
    manager_id: "",
  });
  const [confirmId, setConfirmId] = React.useState("");
  const createMut = useMutation({
    mutationFn: createEmployee,
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
    mutationFn: ({ employee_id, values }) =>
      updateEmployee(employee_id, values),
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
            backgroundColor: "#6a732c",
            "&:hover": {
              backgroundColor: "#6a732c",
            },
            color: "white",
            boxShadow: "none",
            "&:active": {
              boxShadow: "none",
            },
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
              <TextField
                fullWidth
                size="small"
                label="Employee ID"
                {...register("employee_id", { required: true })}
              />
              <TextField
                fullWidth
                size="small"
                label="Name"
                {...register("name", { required: true })}
              />
              <TextField
                fullWidth
                size="small"
                label="Phone"
                {...register("phone_no", { required: true })}
              />
              <TextField
                fullWidth
                size="small"
                label="Email"
                type="email"
                {...register("email", { required: true })}
              />
              <TextField
                fullWidth
                size="small"
                label="Password"
                type="password"
                {...register("password", { required: true })}
              />
              <TextField
                fullWidth
                size="small"
                label="Department ID"
                {...register("department_id", { required: true })}
              />
              <TextField
                fullWidth
                select
                size="small"
                label="Role"
                defaultValue="employee"
                {...register("role", { required: true })}
              >
                <MenuItem value="employee">employee</MenuItem>
                <MenuItem value="staff">staff</MenuItem>
                <MenuItem value="it_admin">it_admin</MenuItem>
                <MenuItem value="admin">admin</MenuItem>
              </TextField>
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
