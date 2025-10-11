import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { listVehicleLogs, exportVehicleLogsCsv } from "../../api/endpoints";
import { Box, Typography, Stack, Button } from "@mui/material";
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
      <Box sx={{ width: "100%" }}>
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
        />
      </Box>
    </Box>
  );
}
