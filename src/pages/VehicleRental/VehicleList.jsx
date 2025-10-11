import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listVehicles, rentVehicle, returnVehicle } from "../../api/endpoints";
import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

// ✅ Custom hook to fetch vehicles (show all to keep unavailable rows visible)
function useVehicles() {
  return useQuery({
    queryKey: ["vehicles", { status: "all" }],
    queryFn: () => listVehicles({ status: "all" }),
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

// ✅ Friendly name if backend has no "name"
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

  // Always compute rows via hook at top level to avoid conditional hook calls
  const rows = useMemo(() => {
    const rows0 = (data || []).map((v) => ({ id: v.id, ...v }));
    if (wheelFilter === "two") return rows0.filter(isTwoWheeler);
    if (wheelFilter === "four") return rows0.filter(isFourWheeler);
    return rows0;
  }, [data, wheelFilter]);

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
        <Box sx={{ width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={[
              {
                field: "plate_name",
                headerName: "Plate - Name",
                flex: 1.4,
                minWidth: 240,
                valueGetter: (_val, row) => {
                  const name = friendlyName(row);
                  const plate = row?.plate || "-";
                  return `${plate} - ${name}`;
                },
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
                          onClick={() => rent.mutate(params.row.id)}
                          disabled={rentingId === params.row.id}
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
                          Taken
                        </Button>
                      ) : null}
                      {occupied && (
                        <Button
                          size="small"
                          variant="contained"
                          color="secondary"
                          onClick={() => returnMut.mutate(params.row.id)}
                          disabled={returningId === params.row.id}
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
            getRowClassName={(params) =>
              String(params.row?.status || "").toLowerCase() === "rented"
                ? "row-unavailable"
                : ""
            }
            sx={{
              "& .row-unavailable": { opacity: 0.6 },
              "& .row-unavailable .MuiDataGrid-cell": { pointerEvents: "none" },
              '& .MuiDataGrid-cell[data-field="actions"]': {
                pointerEvents: "auto",
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
}
