import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listVehicleLogs, exportVehicleLogsCsv } from "../../api/endpoints";
import {
  Box,
  Typography,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DataGrid } from "@mui/x-data-grid";

function useLogs(params) {
  return useQuery({
    queryKey: ["vehicleLogs", params],
    queryFn: () => listVehicleLogs(params),
  });
}

export default function VehicleRentalLogs() {
  const params = {};
  const { data = [], isLoading } = useLogs(params);
  const [previewUrl, setPreviewUrl] = useState(null);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

  const labelForVehicle = (v) => {
    const t = String(v?.type || "").trim();
    if (t) return t.toUpperCase();
    const plate = String(v?.plate || "").toUpperCase();
    if (plate.startsWith("SC")) return "SCOOTY";
    if (plate.startsWith("BK")) return "BIKE";
    if (plate.startsWith("CR")) return "CAR";
    return "VEHICLE";
  };

  const handleExport = async () => {
    try {
      const blob = await exportVehicleLogsCsv(params);
      const url = window.URL.createObjectURL(
        new Blob([blob], { type: "text/csv" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "vehicle_logs.csv");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert(e?.message || "Failed to export CSV");
    }
  };

  const items = data || [];

  const columns = useMemo(
    () => [
      {
        field: "vehicle_type",
        headerName: "Vehicle",
        flex: 1,
        valueGetter: (_value, row) => labelForVehicle(row?.vehicle),
      },
      {
        field: "plate",
        headerName: "Plate",
        width: 140,
        valueGetter: (_value, row) => row?.vehicle?.plate || "-",
      },
      {
        field: "renter",
        headerName: "Renter",
        flex: 1.2,
        valueGetter: (_value, row) => {
          const name = row?.renter?.name || "-";
          const id = row?.renter_id || "-";
          return `${name} (${id})`;
        },
      },
      {
        field: "rented_at",
        headerName: "Rented At",
        width: 200,
        type: "dateTime",
        valueGetter: (value, row) =>
          row?.rented_at ? new Date(row.rented_at) : null,
        valueFormatter: (value) =>
          value ? new Date(value).toLocaleString() : "-",
      },
      {
        field: "returned_at",
        headerName: "Returned At",
        width: 200,
        type: "dateTime",
        valueGetter: (value, row) =>
          row?.returned_at ? new Date(row.returned_at) : null,
        valueFormatter: (value) =>
          value ? new Date(value).toLocaleString() : "-",
      },
      {
        field: "start_km",
        headerName: "Start KM",
        width: 120,
        valueGetter: (_v, row) => row?.odometer?.start_km ?? "-",
      },
      {
        field: "end_km",
        headerName: "End KM",
        width: 120,
        valueGetter: (_v, row) => row?.odometer?.end_km ?? "-",
      },
      {
        field: "trip_km",
        headerName: "Trip (km)",
        width: 130,
        valueGetter: (_v, row) => {
          const s = Number(row?.odometer?.start_km);
          const e = Number(row?.odometer?.end_km);
          if (isNaN(s) || isNaN(e)) return "—";
          const d = e - s;
          return d >= 0 ? Number(d.toFixed(2)) : "—";
        },
      },
      {
        field: "images",
        headerName: "Meter Images",
        flex: 1,
        minWidth: 220,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const startUrl = params?.row?.odometer?.start_image_url;
          const endUrl = params?.row?.odometer?.end_image_url;
          return (
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                disabled={!startUrl}
                onClick={() => startUrl && setPreviewUrl(startUrl)}
              >
                View Start
              </Button>
              <Button
                size="small"
                disabled={!endUrl}
                onClick={() => endUrl && setPreviewUrl(endUrl)}
              >
                View End
              </Button>
            </Stack>
          );
        },
      },
    ],
    []
  );

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography
          variant="h5"
          color="text.secondary"
          sx={{ flexGrow: 1, ml: 2 }}
        >
          Vehicle Rental Logs
        </Typography>
        <Button variant="outlined" onClick={handleExport}>
          Export CSV
        </Button>
      </Stack>
      <Box sx={{ width: "100%", overflowX: 'auto' }}>
        <DataGrid
          rows={items}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          density="compact"
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
            sorting: { sortModel: [{ field: "rented_at", sort: "desc" }] },
          }}
          getRowId={(row) => row.id}
          autoHeight
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
                  No vehicle logs yet
                </Typography>
                <Typography variant="body2">
                  When vehicle rentals are recorded, they will appear here.
                </Typography>
              </Box>
            ),
          }}
        />
      </Box>
      <Dialog
        open={!!previewUrl}
        onClose={() => setPreviewUrl(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pr: 5 }}>
          Meter Image
          <IconButton
            aria-label="close"
            onClick={() => setPreviewUrl(null)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {previewUrl && (
            <Box sx={{ display: "flex", justifyContent: "center", p: 1 }}>
              <img
                src={
                  /^https?:\/\//i.test(previewUrl)
                    ? previewUrl
                    : `${API_BASE}${previewUrl}`
                }
                alt="meter"
                style={{ maxWidth: "100%", maxHeight: 500 }}
                onError={(e) => {
                  e.currentTarget.replaceWith(
                    document.createTextNode(
                      "Image not found. Check server URL and file path."
                    )
                  );
                }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
