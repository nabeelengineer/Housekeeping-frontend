import React, { useEffect, useRef, useState } from "react";
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
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme, useMediaQuery } from "@mui/material";
import CreateRequestDialog from "./CreateRequestDialog";
import { useAuth } from "../../auth/AuthContext";
import { useSnackbar } from "notistack";

function useMyRequests() {
  return useQuery({
    queryKey: ["myRequests"],
    queryFn: () => listRequests(),
    refetchInterval: 15000,
  });
}

function countByStatus(items = []) {
  const init = { pending: 0, in_progress: 0, closed: 0 };
  return items.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, init);
}

export default function EmployeeDashboard() {
  const { data = [], refetch, isLoading } = useMyRequests();
  const [open, setOpen] = useState(false);
  const { employeeId, role } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [viewDesc, setViewDesc] = useState("");
  const mine = (data || []).filter((r) => {
    if (role === "staff") {
      const assignee =
        r.assigned_to || r.staff_id || r.assignedStaff?.employee_id;
      return String(assignee || "") === String(employeeId);
    }
    // default: employee sees their own created requests
    return String(r.employee_id || "") === String(employeeId);
  });
  const counts = countByStatus(mine);

  // Notify staff when a new assignment arrives
  const prevIdsRef = useRef([]);
  useEffect(() => {
    if (role !== "staff") return;
    const currentIds = (mine || []).map((r) => r.request_id);
    const prevIds = prevIdsRef.current || [];
    const newOnes = currentIds.filter((id) => !prevIds.includes(id));
    if (prevIds.length && newOnes.length) {
      enqueueSnackbar(`You have ${newOnes.length} new assigned request(s).`, {
        variant: "info",
      });
    }
    prevIdsRef.current = currentIds;
  }, [mine, role, enqueueSnackbar]);

  const rows = (mine || []).map((r) => {
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

  if (process.env.NODE_ENV !== "production" && mine?.length) {
    // Debug: see actual keys once for employee data
    // eslint-disable-next-line no-console
    console.debug("EmployeeDashboard sample row:", mine[0]);
  }

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <Box>
      <Grid container spacing={3} mb={3} justifyContent="center">
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
                minHeight: 140,
                borderRadius: 3,
                boxShadow: "0px 10px 25px rgba(0,0,0,0.06)",
                p: 2,
                transition: "transform 120ms ease, box-shadow 120ms ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0px 14px 28px rgba(0,0,0,0.09)",
                },
              }}
            >
              <CardContent sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {title}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 800, color, mt: 0.5 }}
                >
                  {counts[key] || 0}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {hint}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {role !== "staff" && (
        <Button
          variant="contained"
          onClick={() => setOpen(true)}
          sx={{
            backgroundColor: 'primary.main',
            color: 'common.white',
            boxShadow: 'none',
            mb: 2,
          }}
        >
          Create Request
        </Button>
      )}

      {isLoading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <DataGrid
            rows={rows}
            columns={[
              {
                field: "request_id",
                headerName: "Request ID",
                flex: 1,
                minWidth: 120,
              },
              ...(role === "staff"
                ? [{ field: "employee_id", headerName: "Employee", width: 120 }]
                : []),
              { field: "floor", headerName: "Floor", width: 110 },
              { field: "unit", headerName: "Unit", width: 100 },
              { field: "type", headerName: "Type", width: 120 },
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
              // Priority removed as per requirement
              // { field: "priority", headerName: "Priority", width: 140 },
              { field: "status", headerName: "Status", width: 140 },
              {
                field: "assigned_display",
                headerName: "Assigned To",
                width: 140,
              },
              {
                field: "closed_display",
                headerName: "Closed Date",
                flex: 1,
                minWidth: 160,
              },
            ]}
            pageSizeOptions={[5, 10, 25]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            autoHeight
            columnVisibilityModel={{
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
                <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {role === 'staff' ? 'Nothing assigned yet' : 'No requests found'}
                  </Typography>
                  <Typography variant="body2">
                    {role === 'staff'
                      ? 'When a request is assigned to you, it will appear here.'
                      : 'Create a request using the button above to get started.'}
                  </Typography>
                </Box>
              ),
            }}
          />
        </Box>
      )}

      {role !== "staff" && (
        <CreateRequestDialog
          open={open}
          onClose={() => setOpen(false)}
          onCreated={() => refetch()}
        />
      )}

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
