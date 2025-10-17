import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listRequests } from "../../api/endpoints";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { GrUpdate } from "react-icons/gr";
import { MdOutlineAssignment } from "react-icons/md";
import { DataGrid } from "@mui/x-data-grid";
import AssignDialog from "./AssignDialog";
import UpdateStatusDialog from "./UpdateStatusDialog";

function useAllRequests(filters) {
  return useQuery({
    queryKey: ["allRequests", filters],
    queryFn: () => listRequests(filters),
  });
}

function countByStatus(items = []) {
  const init = { pending: 0, in_progress: 0, closed: 0 };
  return items.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, init);
}

export default function AdminDashboard() {
  const { data = [], refetch, isLoading } = useAllRequests();
  const counts = countByStatus(data);
  const [assignId, setAssignId] = useState("");
  const [statusId, setStatusId] = useState("");
  const [currentStatus, setCurrentStatus] = useState("pending");
  const [viewDesc, setViewDesc] = useState("");
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const rows = (data || []).map((r) => {
    const assigned =
      r.assigned_to ||
      r.staff_id ||
      r.assignedStaff?.employee_id ||
      r.assignedStaff?.name ||
      "-";
    const closed =
      r.closed_date || r.closed_at
        ? new Date(r.closed_date || r.closed_at).toLocaleString()
        : "-";
    return {
      id: r.request_id,
      assigned_display: assigned,
      closed_display: closed,
      ...r,
    };
  });

  if (process.env.NODE_ENV !== "production" && data?.length) {
    // Debug: see actual keys once to confirm assignee fields
    // eslint-disable-next-line no-console
    console.debug("AdminDashboard sample row:", data[0]);
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        width: "100%",
      }}
    >
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} mb={{ xs: 2, md: 3 }} justifyContent="center">
        {[
          {
            key: "pending",
            title: "Pending",
            color: "warning.main",
            hint: "Total pending requests.",
          },
          {
            key: "in_progress",
            title: "In Progress",
            color: "info.main",
            hint: "Requests being worked on.",
          },
          {
            key: "closed",
            title: "Closed",
            color: "success.main",
            hint: "Resolved and closed requests.",
          },
        ].map(({ key, title, color, hint }) => (
          <Grid item xs={12} sm={6} md={4} key={key}>
            <Card
              sx={{
                width: "100%",
                minHeight: { xs: 110, sm: 130, md: 140 },
                borderRadius: 3,
                boxShadow: "0px 10px 25px rgba(0,0,0,0.06)",
                p: { xs: 1.5, md: 2 },
                transition: "transform 120ms ease, box-shadow 120ms ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0px 14px 28px rgba(0,0,0,0.09)",
                },
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, md: 2 }, textAlign: "center" }}>
                <Typography
                  variant={isXs ? "body2" : "subtitle1"}
                  sx={{ fontWeight: 700 }}
                  align="center"
                >
                  {title}
                </Typography>
                <Typography
                  variant={isXs ? "h5" : "h4"}
                  sx={{ fontWeight: 800, color, mt: 0.5 }}
                  align="center"
                >
                  {counts[key] || 0}
                </Typography>
                <Typography
                  variant={isXs ? "caption" : "body2"}
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                  align="center"
                >
                  {hint}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {isLoading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Box sx={{ width: "100%", overflowX: 'auto' }}>
          <DataGrid
            rows={rows}
            columns={[
              {
                field: "request_id",
                headerName: "Request ID",
                flex: 1,
                minWidth: 120,
              },
              {
                field: "employee_id",
                headerName: "Employee",
                flex: 1,
                minWidth: 90,
              },
              { field: "floor", headerName: "Floor", width: 110 },
              { field: "unit", headerName: "Unit", width: 100 },
              { field: "type", headerName: "Type", flex: 0.8, minWidth: 70 },
              {
                field: "description",
                headerName: "About",
                flex: 1.6,
                minWidth: 200,
                renderCell: (params) => {
                  const text = params.value || "-";
                  return (
                    <Button
                      size="small"
                      variant="text"
                      title={text}
                      sx={{
                        textTransform: "none",
                        justifyContent: "flex-start",
                        p: 0,
                        minWidth: 0,
                        width: "100%",
                        border: "none",
                        outline: "none",
                        boxShadow: "none",
                        "&:focus": { outline: "none" },
                        "&:hover": { backgroundColor: "transparent" },
                      }}
                      onClick={() => text !== "-" && setViewDesc(text)}
                    >
                      <Typography noWrap sx={{ width: "100%" }}>
                        {text}
                      </Typography>
                    </Button>
                  );
                },
              },
              {
                field: "status",
                headerName: "Status",
                flex: 0.9,
                minWidth: 90,
              },
              {
                field: "assigned_display",
                headerName: "Assigned To",
                flex: 1,
                minWidth: 110,
              },
              {
                field: "closed_display",
                headerName: "Closed Date",
                flex: 1,
                minWidth: 140,
              },
              {
                field: "actions",
                headerName: "Actions",
                width: 120,
                sortable: false,
                filterable: false,
                renderCell: (params) => (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="Assign">
                      <IconButton
                        size="small"
                        aria-label="assign"
                        onClick={() => setAssignId(params.row.request_id)}
                      >
                        <MdOutlineAssignment />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Update">
                      <IconButton
                        size="small"
                        aria-label="update"
                        onClick={() => {
                          setStatusId(params.row.request_id);
                          setCurrentStatus(params.row.status);
                        }}
                      >
                        <GrUpdate />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ),
              },
            ]}
            pageSizeOptions={[5, 10, 25]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            autoHeight
            disableRowSelectionOnClick
            density="compact"
            columnVisibilityModel={{
              // Hide less-important columns on very small screens
              floor: !isXs,
              unit: !isXs,
              assigned_display: !isXs,
              closed_display: !isXs,
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
                    No requests yet
                  </Typography>
                  <Typography variant="body2">
                    When requests are created, they will appear here.
                  </Typography>
                </Box>
              ),
            }}
          />
        </Box>
      )}

      <AssignDialog
        open={!!assignId}
        onClose={() => setAssignId("")}
        requestId={assignId}
        onAssigned={() => refetch()}
      />
      <UpdateStatusDialog
        open={!!statusId}
        onClose={() => setStatusId("")}
        requestId={statusId}
        currentStatus={currentStatus}
        onUpdated={() => refetch()}
      />

      <Dialog
        open={!!viewDesc}
        onClose={() => setViewDesc("")}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Description</DialogTitle>
        <DialogContent>
          <Typography sx={{ whiteSpace: "pre-wrap", mt: 1 }}>
            {viewDesc}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDesc("")}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
