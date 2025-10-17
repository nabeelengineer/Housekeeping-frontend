import React, { useMemo, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataGrid } from "@mui/x-data-grid";
import {
  listVehicles,
  adminCreateVehicle,
  adminUpdateVehicle,
  adminDeleteVehicle,
  listMonthlyDistance,
} from "../../api/endpoints";

function daysLeft(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  const d = new Date(dateStr);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil(
    (d.setHours(0, 0, 0, 0) - new Date(today.setHours(0, 0, 0, 0))) / msPerDay
  );
}

function DocBadge({ label, validTo }) {
  const left = daysLeft(validTo);
  let color = "default";
  let variant = "outlined";
  let text = `${label}: —`;
  if (left === null) {
    text = `${label}: —`;
  } else if (left < 0) {
    text = `${label}: EXPIRED`;
    color = "error";
    variant = "filled";
  } else if ([1, 2, 5, 10, 15].includes(left)) {
    text = `${label}: ${left}d left`;
    color = "warning";
    variant = "filled";
  } else {
    text = `${label}: ${left}d`;
    color = "success";
  }
  return <Chip size="small" label={text} color={color} variant={variant} />;
}

function useVehiclesAll() {
  return useQuery({
    queryKey: ["vehicles", { status: "all" }],
    queryFn: () => listVehicles({ status: "all" }),
  });
}

function VehicleForm({ open, onClose, initial }) {
  const qc = useQueryClient();
  const isEdit = !!initial?.id;
  const [form, setForm] = useState({
    name: initial?.name || "",
    type: initial?.type || "car",
    wheelers: initial?.wheelers || "4",
    plate: initial?.plate || "",
    chassis_no: initial?.chassis_no || "",
    insurance_valid_from: initial?.insurance_valid_from || "",
    insurance_valid_to: initial?.insurance_valid_to || "",
    rc_valid_from: initial?.rc_valid_from || "",
    rc_valid_to: initial?.rc_valid_to || "",
    pollution_valid_from: initial?.pollution_valid_from || "",
    pollution_valid_to: initial?.pollution_valid_to || "",
  });
  const [files, setFiles] = useState({});

  const createMut = useMutation({
    mutationFn: (fd) => adminCreateVehicle(fd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vehicles"] });
      onClose();
    },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, fd }) => adminUpdateVehicle(id, fd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vehicles"] });
      onClose();
    },
  });

  const handleFile = (key) => (e) =>
    setFiles((p) => ({ ...p, [key]: e.target.files?.[0] }));
  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).trim() !== "")
        fd.append(k, v);
    });
    Object.entries(files).forEach(([k, f]) => {
      if (f) fd.append(k, f);
    });
    if (isEdit) updateMut.mutate({ id: initial.id, fd });
    else createMut.mutate(fd);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? "Update Vehicle" : "Create Vehicle"}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              name="name"
              label="Vehicle Name"
              value={form.name}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              select
              name="type"
              label="Type"
              value={form.type}
              onChange={handleChange}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="car">Car</MenuItem>
              <MenuItem value="scooter">Scooter</MenuItem>
              <MenuItem value="bike">Bike</MenuItem>
            </TextField>
            <TextField
              select
              name="wheelers"
              label="Wheelers"
              value={form.wheelers}
              onChange={handleChange}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="2">2</MenuItem>
              <MenuItem value="4">4</MenuItem>
            </TextField>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              name="plate"
              label="Plate No"
              value={form.plate}
              onChange={handleChange}
              required
              sx={{ minWidth: 200 }}
            />
            <TextField
              name="chassis_no"
              label="Chassis No"
              value={form.chassis_no}
              onChange={handleChange}
              sx={{ minWidth: 200 }}
            />
          </Stack>

          <Typography variant="subtitle2">Vehicle Image</Typography>
          <input
            type="file"
            accept="image/*"
            onChange={handleFile("vehicle_image")}
          />

          <Typography variant="subtitle2">Insurance</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFile("insurance_image")}
            />
            <TextField
              name="insurance_valid_from"
              label="From (YYYY-MM-DD)"
              value={form.insurance_valid_from}
              onChange={handleChange}
            />
            <TextField
              name="insurance_valid_to"
              label="To (YYYY-MM-DD)"
              value={form.insurance_valid_to}
              onChange={handleChange}
            />
          </Stack>

          <Typography variant="subtitle2">RC</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFile("rc_image")}
            />
            <TextField
              name="rc_valid_from"
              label="From (YYYY-MM-DD)"
              value={form.rc_valid_from}
              onChange={handleChange}
            />
            <TextField
              name="rc_valid_to"
              label="To (YYYY-MM-DD)"
              value={form.rc_valid_to}
              onChange={handleChange}
            />
          </Stack>

          <Typography variant="subtitle2">Pollution</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFile("pollution_image")}
            />
            <TextField
              name="pollution_valid_from"
              label="From (YYYY-MM-DD)"
              value={form.pollution_valid_from}
              onChange={handleChange}
            />
            <TextField
              name="pollution_valid_to"
              label="To (YYYY-MM-DD)"
              value={form.pollution_valid_to}
              onChange={handleChange}
            />
          </Stack>

          <Typography variant="subtitle2">Other Paper</Typography>
          <input
            type="file"
            accept="image/*"
            onChange={handleFile("paper_image")}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            backgroundColor: "primary.main",
            color: "common.white",
            boxShadow: "none",
          }}
        >
          {isEdit ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function VehiclesAdmin() {
  const qc = useQueryClient();
  const { data = [] } = useVehiclesAll();
  const rows = useMemo(
    () => (data || []).map((v) => ({ id: v.id, ...v })),
    [data]
  );

  // Month selector for distance
  const fmtMonth = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const [month, setMonth] = useState(fmtMonth(new Date()));
  const { data: monthDist = [] } = useQuery({
    queryKey: ["vehicles-monthly-distance", month],
    queryFn: () => listMonthlyDistance({ month }),
    staleTime: 30_000,
  });
  const distMap = useMemo(() => {
    const m = new Map();
    (monthDist || []).forEach((r) => m.set(r.vehicle_id, r.distance_km));
    return m;
  }, [monthDist]);

  const del = useMutation({
    mutationFn: (id) => adminDeleteVehicle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicles"] }),
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography
          variant="h5"
          color="text.secondary"
          sx={{ flexGrow: 1, ml: 2 }}
        >
          All Vehicles
        </Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          sx={{
            backgroundColor: "primary.main",
            color: "common.white",
            mr: 3,
          }}
        >
          Add Vehicle
        </Button>
      </Stack>

      <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <DataGrid
        rows={rows}
        columns={[
          { field: "plate", headerName: "Plate", width: 160 },
          { field: "name", headerName: "Name", flex: 1, minWidth: 160 },
          { field: "type", headerName: "Type", width: 120 },
          { field: "wheelers", headerName: "Wheels", width: 110 },
          { field: "status", headerName: "Status", width: 130 },
          {
            field: "distance_km",
            headerName: "Distance (km)",
            width: 150,
            valueGetter: (_v, row) => {
              const v = distMap.get(row.id);
              return v != null ? Number(Number(v).toFixed(2)) : "—";
            },
          },
          {
            field: "docs",
            headerName: "Documents",
            flex: 1.6,
            minWidth: 360,
            renderCell: (params) => (
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                <DocBadge label="INS" validTo={params.row.insurance_valid_to} />
                <DocBadge label="RC" validTo={params.row.rc_valid_to} />
                <DocBadge
                  label="POLL"
                  validTo={params.row.pollution_valid_to}
                />
              </Stack>
            ),
          },
          {
            field: "actions",
            headerName: "Actions",
            width: 140,
            sortable: false,
            renderCell: (params) => (
              <Stack direction="row" spacing={1}>
                <IconButton
                  size="small"
                  onClick={() => {
                    setEditing(params.row);
                    setOpen(true);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => del.mutate(params.row.id)}
                  disabled={
                    String(params.row.status).toLowerCase() === "rented"
                  }
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            ),
          },
        ]}
        pageSizeOptions={[5, 10, 25]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        autoHeight
        disableRowSelectionOnClick
        density="compact"
        sx={{
          "& .MuiDataGrid-cell, & .MuiDataGrid-columnHeader": {
            py: { xs: 0.5, sm: 1 },
            px: { xs: 0.5, sm: 1 },
            fontSize: { xs: 12, sm: 13 },
          },
          "& .MuiDataGrid-columnHeaders": {
            minHeight: { xs: 40, sm: 48 },
            lineHeight: { xs: '40px', sm: '48px' },
          },
          "& .MuiDataGrid-row": {
            maxHeight: { xs: 44, sm: 52 },
            minHeight: { xs: 44, sm: 52 },
          },
        }}
        slots={{
          noRowsOverlay: () => (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                color: "text.secondary",
                p: 4,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                No vehicles yet
              </Typography>
              <Typography variant="body2">
                Add a vehicle using the button above to see it listed here.
              </Typography>
            </Box>
          ),
        }}
      />
      </Box>

      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
        <Typography variant="body2">Month:</Typography>
        <TextField
          type="month"
          size="small"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          sx={{ width: 180 }}
        />
        <Typography variant="caption" color="text.secondary">
          Showing distance covered per vehicle in selected month
        </Typography>
      </Stack>

      {open && (
        <VehicleForm
          open={open}
          onClose={() => setOpen(false)}
          initial={editing}
        />
      )}
    </Box>
  );
}
