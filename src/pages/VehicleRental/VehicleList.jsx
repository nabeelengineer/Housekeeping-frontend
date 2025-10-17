import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listVehicles,
  rentVehicle,
  returnVehicle,
  startOdometer,
  endOdometer,
  myActiveRentals,
} from "../../api/endpoints";
import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

// Custom hook to fetch vehicles (show all to keep unavailable rows visible)
function useVehicles() {
  return useQuery({
    queryKey: ["vehicles", { status: "all" }],
    queryFn: () => listVehicles({ status: "all" }),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

const labelForVehicle = (v) => {
  const t = String(v?.type || "").trim();
  if (t) return t.toUpperCase();
  const plate = String(v?.plate || "").toUpperCase();
  if (plate.startsWith("SC")) return "SCOOTY";
  if (plate.startsWith("BK")) return "BIKE";
  if (plate.startsWith("CR")) return "CAR";
  return "VEHICLE";
};

// Helpers to determine wheel category robustly
const isTwoWheeler = (v) => {
  const t = String(v?.type || "").toLowerCase();
  if (t === "bike" || t === "scooter" || t === "scooty" || t.includes("two"))
    return true;
  const label = labelForVehicle(v).toLowerCase();
  return label === "bike" || label === "scooty";
};
const isFourWheeler = (v) => {
  const t = String(v?.type || "").toLowerCase();
  if (t === "car" || t.includes("four")) return true;
  const label = labelForVehicle(v).toLowerCase();
  return label === "car";
};

// Friendly name if backend has no "name"
const friendlyName = (v) => {
  if (v?.name) return v.name;
  const type = (v?.type || "").toLowerCase();
  const plate = String(v?.plate || "").toUpperCase();
  // Explicit plate-to-name overrides
  const overrides = {
    "SC-001": "Honda Activa",
    SC_001: "Honda Activa",
    "SC-002": "TVS Jupiter",
    SC_002: "TVS Jupiter",
    "CR-001": "EV Neon",
    CR_001: "EV Neon",
    "BK-001": "TVS Raider",
    BK_001: "TVS Raider",
    "BK-002": "Hero Passion",
    BK_002: "Hero Passion",
    "BK-003": "Honda Shine",
    BK_003: "Honda Shine",
  };
  if (overrides[plate]) return overrides[plate];
  const bikes = ["Hero Passion", "TVS Raider"];
  const cars = ["EV Neon", "WagonR", "Tigor"];
  const scootys = ["Honda Activa", "TVS Jupiter"];
  const hash =
    String(v?.plate || "")
      .split("")
      .reduce((a, c) => a + c.charCodeAt(0), 0) || 0;
  if (type.includes("scooty") || type.includes("scooter"))
    return scootys[hash % scootys.length];
  if (type.includes("bike") || type.includes("motor") || type.includes("two"))
    return bikes[hash % bikes.length];
  if (type.includes("car")) return cars[hash % cars.length];
  return "Vehicle";
};

// Main Component
export default function VehicleList() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useVehicles();
  const [wheelFilter, setWheelFilter] = useState("all");
  // Track which row is acting to avoid blinking all buttons
  const [rentingId, setRentingId] = useState(null);
  const [returningId, setReturningId] = useState(null);
  // Odometer dialogs state
  const [openTake, setOpenTake] = useState(false);
  const [openReturn, setOpenReturn] = useState(false);
  const [activeVehicleId, setActiveVehicleId] = useState(null);
  const [startKm, setStartKm] = useState("");
  const [startFile, setStartFile] = useState(null);
  const [endKm, setEndKm] = useState("");
  const [endFile, setEndFile] = useState(null);

  const rent = useMutation({
    mutationFn: (id) => rentVehicle(id),
    onMutate: (id) => setRentingId(id),
    onSettled: () => setRentingId(null),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vehicles"] });
      qc.invalidateQueries({ queryKey: ["myActiveRentals"] });
    },
  });
  const returnMut = useMutation({
    mutationFn: (id) => returnVehicle(id),
    onMutate: (id) => setReturningId(id),
    onSettled: () => setReturningId(null),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vehicles"] });
      qc.invalidateQueries({ queryKey: ["myActiveRentals"] });
    },
  });

  const handleOpenTake = (vehicleId) => {
    setActiveVehicleId(vehicleId);
    setStartKm("");
    setStartFile(null);
    setOpenTake(true);
  };

  const handleSubmitTake = async () => {
    if (!startKm || !startFile) {
      alert("Please enter start km and choose an image");
      return;
    }
    try {
      const { log } = await rent.mutateAsync(activeVehicleId);
      const fd = new FormData();
      fd.append("start_km", String(startKm));
      fd.append("start_meter_image", startFile);
      await startOdometer(log.id, fd);
      setOpenTake(false);
      setActiveVehicleId(null);
      qc.invalidateQueries({ queryKey: ["vehicles"] });
      qc.invalidateQueries({ queryKey: ["myActiveRentals"] });
    } catch (e) {
      alert(
        e?.response?.data?.error || e?.message || "Failed to start odometer"
      );
    }
  };

  const handleOpenReturn = (vehicleId) => {
    setActiveVehicleId(vehicleId);
    setEndKm("");
    setEndFile(null);
    setOpenReturn(true);
  };

  const handleSubmitReturn = async () => {
    if (!endKm || !endFile) {
      alert("Please enter end km and choose an image");
      return;
    }
    try {
      // find the active rental for this vehicle
      const rentals = await myActiveRentals();
      const rental = (rentals || []).find(
        (r) => r.vehicle_id === activeVehicleId
      );
      if (!rental) {
        alert("No active rental found");
        return;
      }
      const fd = new FormData();
      fd.append("end_km", String(endKm));
      fd.append("end_meter_image", endFile);
      await endOdometer(rental.id, fd);
      await returnMut.mutateAsync(activeVehicleId);
      setOpenReturn(false);
      setActiveVehicleId(null);
      qc.invalidateQueries({ queryKey: ["vehicles"] });
      qc.invalidateQueries({ queryKey: ["myActiveRentals"] });
    } catch (e) {
      alert(
        e?.response?.data?.error ||
          e?.message ||
          "Failed to end odometer / return"
      );
    }
  };

  // Always compute rows via hook at top level to avoid conditional hook calls
  const rows = useMemo(() => {
    const rows0 = (data || []).map((v) => ({ id: v.id, ...v }));
    if (wheelFilter === "two") return rows0.filter(isTwoWheeler);
    if (wheelFilter === "four") return rows0.filter(isFourWheeler);
    return rows0;
  }, [data, wheelFilter]);

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        mb={2}
        gap={1}
      >
        <Typography variant="h6">Available Vehicles</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <ToggleButtonGroup
            size="small"
            exclusive
            value={wheelFilter}
            onChange={(_, val) => val && setWheelFilter(val)}
          >
            <ToggleButton value="all">ALL</ToggleButton>
            <ToggleButton value="two">2-wheelers</ToggleButton>
            <ToggleButton value="four">4-wheelers</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>

      {/* Loader or Table */}
      {isLoading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <DataGrid
            rows={rows}
            columns={[
              { field: "plate", headerName: "Plate", width: 150 },
              {
                field: "name",
                headerName: "Name",
                flex: 1.2,
                minWidth: 200,
                valueGetter: (_val, row) => friendlyName(row),
              },
              {
                field: "type",
                headerName: "Type",
                width: 130,
                valueGetter: (_val, row) => labelForVehicle(row),
              },
              {
                field: "occupied",
                headerName: "Occupied",
                width: 140,
                renderCell: (params) => {
                  const occupied =
                    String(params.row?.status || "").toLowerCase() === "rented";
                  return (
                    <Chip
                      size="small"
                      label={occupied ? "Unavailable" : "Available"}
                      color={occupied ? "error" : "success"}
                      variant={occupied ? "filled" : "outlined"}
                    />
                  );
                },
              },
              {
                field: "actions",
                headerName: "Actions",
                width: 140,
                sortable: false,
                filterable: false,
                renderCell: (params) => {
                  const occupied =
                    String(params.row?.status || "").toLowerCase() === "rented";
                  return (
                    <Stack direction="row" spacing={1}>
                      {!occupied ? (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleOpenTake(params.row.id)}
                          disabled={rentingId === params.row.id}
                          sx={{
                            backgroundColor: "primary.main",
                            color: "common.white",
                            boxShadow: "none",
                          }}
                        >
                          Taken
                        </Button>
                      ) : null}
                      {occupied && (
                        <Button
                          size="small"
                          variant="contained"
                          color="secondary"
                          onClick={() => handleOpenReturn(params.row.id)}
                          disabled={returningId === params.row.id}
                          sx={{
                            backgroundColor: "primary.main",
                            color: "common.white",
                            boxShadow: "none",
                          }}
                        >
                          Return
                        </Button>
                      )}
                    </Stack>
                  );
                },
              },
            ]}
            pageSizeOptions={[5, 10, 25]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            autoHeight
            disableRowSelectionOnClick
            density="compact"
            columnVisibilityModel={{
              type: !isXs,
              occupied: !isXs,
            }}
            sx={{
              "& .MuiDataGrid-cell, & .MuiDataGrid-columnHeader": {
                py: { xs: 0.5, sm: 1 },
                px: { xs: 0.5, sm: 1 },
                fontSize: { xs: 12, sm: 13 },
              },
              "& .MuiDataGrid-columnHeaders": {
                minHeight: { xs: 40, sm: 48 },
                lineHeight: { xs: "40px", sm: "48px" },
              },
              "& .MuiDataGrid-row": {
                maxHeight: { xs: 44, sm: 52 },
                minHeight: { xs: 44, sm: 52 },
              },
              "& .row-unavailable": { opacity: 0.6 },
              "& .row-unavailable .MuiDataGrid-cell": { pointerEvents: "none" },
              '& .MuiDataGrid-cell[data-field="actions"]': { pointerEvents: "auto" },
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
                    p: { xs: 2, md: 4 },
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    No vehicles available
                  </Typography>
                  <Typography variant="body2">
                    Try changing filters above or check back later.
                  </Typography>
                </Box>
              ),
            }}
            getRowClassName={(params) =>
              String(params.row?.status || "").toLowerCase() === "rented"
                ? "row-unavailable"
                : ""
            }
          />
        </Box>
      )}

      {/* Take dialog */}
      <Dialog
        open={openTake}
        onClose={() => setOpenTake(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Start Odometer</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Start KM"
              type="number"
              value={startKm}
              onChange={(e) => setStartKm(e.target.value)}
              inputProps={{ min: 0, step: "0.1" }}
            />
            <Button component="label" variant="outlined">
              Upload Meter Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setStartFile(e.target.files?.[0] || null)}
              />
            </Button>
            <Typography variant="caption" color="text.secondary">
              {startFile ? startFile.name : "No file chosen"}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTake(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitTake}
            sx={{ backgroundColor: "primary.main" }}
          >
            Save & Start
          </Button>
        </DialogActions>
      </Dialog>

      {/* Return dialog */}
      <Dialog
        open={openReturn}
        onClose={() => setOpenReturn(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>End Odometer</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="End KM"
              type="number"
              value={endKm}
              onChange={(e) => setEndKm(e.target.value)}
              inputProps={{ min: 0, step: "0.1" }}
            />
            <Button component="label" variant="outlined">
              Upload Meter Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setEndFile(e.target.files?.[0] || null)}
              />
            </Button>
            <Typography variant="caption" color="text.secondary">
              {endFile ? endFile.name : "No file chosen"}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReturn(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitReturn}
            sx={{ backgroundColor: "primary.main" }}
          >
            Save & Return
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
