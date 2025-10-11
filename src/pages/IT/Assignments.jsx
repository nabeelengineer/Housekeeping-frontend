import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listAssignments,
  assignAsset,
  returnAssignment,
  listAssets,
  updateAssignment,
  updateAsset,
} from "../../api/endpoints";
import {
  Box,
  Stack,
  Typography,
  Button,
  TextField,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Divider,
  Tabs,
  Tab,
} from "@mui/material";
import { useSnackbar } from "notistack";

export default function ITAssignments() {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [filters, setFilters] = React.useState({ status: "active" });
  // Modals state
  const [open, setOpen] = React.useState(false);
  const [openReturn, setOpenReturn] = React.useState(false);
  const [openView, setOpenView] = React.useState(false);
  const [selected, setSelected] = React.useState(null);
  const [returnForm, setReturnForm] = React.useState({
    notes: "",
    conditionOnReturn: "",
    retired: false,
    retireReason: "",
  });
  const [viewForm, setViewForm] = React.useState({
    notes: "",
    conditionOnReturn: "",
    retired: false,
    retireReason: "",
  });
  const [viewEditMode, setViewEditMode] = React.useState(false);
  // assetCode can be Asset ID (e.g., LAP-001) or Serial Number; we'll resolve to UUID before calling API
  const [assignForm, setAssignForm] = React.useState({
    assetCode: "",
    employeeId: "",
    notes: "",
    conditionOnAssign: "",
  });
  const [assignError, setAssignError] = React.useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["assignments", filters],
    queryFn: () => listAssignments(filters),
  });

  const assign = useMutation({
    mutationFn: async ({ assetCode, employeeId, notes, conditionOnAssign }) => {
      // Resolve asset by Asset ID or Serial using listAssets?q=
      setAssignError("");
      const res = await listAssets({ q: assetCode, page: 1, pageSize: 1 });
      const asset = (res?.data || [])[0];
      if (!asset) {
        throw new Error("No asset found for the given Asset ID or Serial");
      }
      // If asset is not active, try to find who currently has it and show a helpful message
      if (String(asset.status || "").toLowerCase() !== "active") {
        try {
          const ares = await listAssignments({ assetId: asset.id, status: "active", page: 1, pageSize: 1 });
          const current = (ares?.data || [])[0];
          if (current) {
            const who = current?.employee?.name
              ? `${current.employee.name} (${current.employee.employee_id})`
              : current.employeeId || "";
            throw new Error(`Asset is assigned to employee ${who}`);
          }
        } catch (_) {
          // ignore fetch issues and fallback to generic message
        }
        throw new Error("Asset is not available for assignment");
      }
      return assignAsset({
        assetId: asset.id,
        employeeId,
        notes,
        conditionOnAssign,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignments"] });
      setAssignForm({
        assetCode: "",
        employeeId: "",
        notes: "",
        conditionOnAssign: "",
      });
      setOpen(false);
    },
    onError: (e) => {
      const msg =
        e?.response?.data?.message || e?.message || "Assignment failed";
      setAssignError(msg);
    },
  });

  const ret = useMutation({
    mutationFn: ({ id, payload }) => returnAssignment(id, payload),
    onSuccess: async (_res, _vars, _ctx) => {
      // If retired, also mark the underlying asset as retired
      try {
        if (returnForm.retired && (selected?.asset?.id || selected?.assetId)) {
          const assetId = selected?.asset?.id || selected?.assetId;
          await updateAsset(assetId, {
            status: "retired",
            retireReason: returnForm.retireReason || returnForm.notes || "",
          });
          // persist on assignment too so history shows 'retired'
          await updateAssignment(selected.id, {
            retired: true,
            status: "retired",
            retireReason: returnForm.retireReason || returnForm.notes || "",
          });
          enqueueSnackbar("Asset marked as retired", { variant: "success" });
        }
      } catch (e) {
        enqueueSnackbar(
          "Failed to mark retired on server. Count may not update.",
          {
            variant: "warning",
          }
        );
      }
      qc.invalidateQueries({ queryKey: ["assignments"] });
      qc.invalidateQueries({ queryKey: ["assetsSummary"] });
      qc.invalidateQueries({ queryKey: ["adminLogs"] });
      setOpenReturn(false);
    },
  });

  const updateReturned = useMutation({
    mutationFn: ({ id, payload }) => updateAssignment(id, payload),
    onSuccess: async () => {
      // If toggled to retired in view editor, update asset too
      try {
        if (viewForm.retired && (selected?.asset?.id || selected?.assetId)) {
          const assetId = selected?.asset?.id || selected?.assetId;
          await updateAsset(assetId, {
            status: "retired",
            retireReason: viewForm.retireReason || viewForm.notes || "",
          });
          await updateAssignment(selected.id, {
            retired: true,
            status: "retired",
            retireReason: viewForm.retireReason || viewForm.notes || "",
          });
          enqueueSnackbar("Saved. Asset is retired.", { variant: "success" });
        } else if (
          !viewForm.retired &&
          (selected?.asset?.id || selected?.assetId)
        ) {
          // Unmark retired: bring back to returned/active
          const assetId = selected?.asset?.id || selected?.assetId;
          await updateAsset(assetId, {
            status: "active",
            retireReason: undefined,
          });
          await updateAssignment(selected.id, {
            retired: false,
            status: "returned",
            retireReason: "",
          });
          enqueueSnackbar("Asset marked as returned.", { variant: "success" });
        }
      } catch (e) {
        enqueueSnackbar("Failed to update retirement on server.", {
          variant: "warning",
        });
      }
      qc.invalidateQueries({ queryKey: ["assignments"] });
      qc.invalidateQueries({ queryKey: ["assetsSummary"] });
      qc.invalidateQueries({ queryKey: ["adminLogs"] });
      setViewEditMode(false);
      setOpenView(false);
    },
  });

  const isHistoryView = filters.status === "returned";
  // Local search UI state (avoid refetch on typing)
  const [searchField, setSearchField] = React.useState("none");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Options for select based on tab
  const activeOptions = [
    { value: "none", label: "All" },
    { value: "employeeId", label: "Employee ID" },
    { value: "assetCode", label: "Asset ID / Serial" },
    { value: "employeeName", label: "Employee Name" },
  ];
  const historyOptions = [
    { value: "none", label: "All" },
    { value: "assignmentId", label: "Assignment ID" },
    { value: "assetCode", label: "Asset ID" },
    { value: "assetType", label: "Type" },
    { value: "brand", label: "Brand" },
    { value: "employeeId", label: "Employee ID" },
    { value: "assignedDate", label: "Assigned At (Date)" },
    { value: "returnedDate", label: "Returned At (Date)" },
  ];
  const selectOptions = isHistoryView ? historyOptions : activeOptions;

  // Keep searchField within available options when switching tabs
  React.useEffect(() => {
    if (!selectOptions.some((o) => o.value === searchField)) {
      setSearchField(selectOptions[0].value);
    }
  }, [isHistoryView]);

  // Single search handler used by button and Enter key
  const doSearch = React.useCallback(async () => {
    const q = (searchQuery || "").trim();
    // All -> clear
    if (searchField === "none") {
      setFilters((f) => ({
        ...f,
        employeeId: undefined,
        employeeName: undefined,
        assetId: undefined,
        serialNumber: undefined,
        model: undefined,
        assetType: undefined,
        brand: undefined,
        assignmentId: undefined,
        assignedDate: undefined,
        returnedDate: undefined,
      }));
      setSearchQuery("");
      qc.invalidateQueries({ queryKey: ["assignments"] });
      return;
    }
    // Empty -> reset
    if (!q) {
      setFilters((f) => ({
        ...f,
        employeeId: undefined,
        employeeName: undefined,
        assetId: undefined,
        serialNumber: undefined,
        model: undefined,
        assetType: undefined,
        brand: undefined,
        assignmentId: undefined,
        assignedDate: undefined,
        returnedDate: undefined,
      }));
      qc.invalidateQueries({ queryKey: ["assignments"] });
      return;
    }

    // Apply per-field logic
    if (searchField === "assignmentId") {
      setFilters((f) => ({
        ...f,
        assignmentId: q,
        employeeId: undefined,
        employeeName: undefined,
        assetId: undefined,
        serialNumber: undefined,
        model: undefined,
        assetType: undefined,
        brand: undefined,
        assignedDate: undefined,
        returnedDate: undefined,
      }));
    } else if (searchField === "employeeId") {
      setFilters((f) => ({
        ...f,
        employeeId: q,
        employeeName: undefined,
        assetId: undefined,
        serialNumber: undefined,
        model: undefined,
        assetType: undefined,
      }));
    } else if (searchField === "employeeName") {
      setFilters((f) => ({
        ...f,
        employeeName: q,
        employeeId: undefined,
        assetId: undefined,
        serialNumber: undefined,
        model: undefined,
        assetType: undefined,
      }));
    } else if (searchField === "assetCode") {
      // Resolve Asset ID by Asset ID or Serial
      const res = await listAssets({ q, page: 1, pageSize: 1 });
      const asset = (res?.data || [])[0];
      setFilters((f) => ({
        ...f,
        assetId: asset?.id,
        employeeId: undefined,
        employeeName: undefined,
        serialNumber: undefined,
        model: undefined,
        assetType: undefined,
        brand: undefined,
        assignedDate: undefined,
        returnedDate: undefined,
      }));
    } else if (searchField === "serialNumber") {
      setFilters((f) => ({
        ...f,
        serialNumber: q,
        employeeId: undefined,
        employeeName: undefined,
        assetId: undefined,
        model: undefined,
        assetType: undefined,
      }));
    } else if (searchField === "model") {
      setFilters((f) => ({
        ...f,
        model: q,
        employeeId: undefined,
        employeeName: undefined,
        assetId: undefined,
        serialNumber: undefined,
        assetType: undefined,
      }));
    } else if (searchField === "assetType") {
      setFilters((f) => ({
        ...f,
        assetType: q,
        employeeId: undefined,
        employeeName: undefined,
        assetId: undefined,
        serialNumber: undefined,
        model: undefined,
        brand: undefined,
      }));
    } else if (searchField === "brand") {
      setFilters((f) => ({
        ...f,
        brand: q,
        employeeId: undefined,
        employeeName: undefined,
        assetId: undefined,
        serialNumber: undefined,
        model: undefined,
        assetType: undefined,
      }));
    } else if (searchField === "assignedDate") {
      setFilters((f) => ({
        ...f,
        assignedDate: q,
        returnedDate: undefined,
        employeeId: undefined,
        employeeName: undefined,
        brand: undefined,
        assetId: undefined,
        model: undefined,
        serialNumber: undefined,
      }));
    } else if (searchField === "returnedDate") {
      setFilters((f) => ({
        ...f,
        returnedDate: q,
        assignedDate: undefined,
        employeeId: undefined,
        employeeName: undefined,
        brand: undefined,
        assetId: undefined,
        model: undefined,
        serialNumber: undefined,
      }));
    }
    qc.invalidateQueries({ queryKey: ["assignments"] });
  }, [searchField, searchQuery, setFilters, qc]);

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5">IT Assignments</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            onClick={() => {
              setAssignError("");
              setOpen(true);
            }}
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
            Assign +
          </Button>
        </Stack>
      </Stack>

      {/* Assign modal */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Assign Asset</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Asset ID or Serial"
              value={assignForm.assetCode}
              onChange={(e) =>
                setAssignForm({ ...assignForm, assetCode: e.target.value })
              }
              size="small"
              helperText="Enter LAP-001 or SN123...; we'll auto-find the asset"
              InputLabelProps={{ sx: { color: "#141414" } }}
              InputProps={{ sx: { color: "#111827" } }}
            />
            <TextField
              label="Employee ID"
              value={assignForm.employeeId}
              onChange={(e) =>
                setAssignForm({ ...assignForm, employeeId: e.target.value })
              }
              size="small"
              InputLabelProps={{ sx: { color: "#141414" } }}
              InputProps={{ sx: { color: "#111827" } }}
            />
            <TextField
              label="Notes"
              value={assignForm.notes}
              onChange={(e) =>
                setAssignForm({ ...assignForm, notes: e.target.value })
              }
              size="small"
              InputLabelProps={{ sx: { color: "#141414" } }}
              InputProps={{ sx: { color: "#111827" } }}
            />
            <TextField
              label="Condition"
              value={assignForm.conditionOnAssign}
              onChange={(e) =>
                setAssignForm({
                  ...assignForm,
                  conditionOnAssign: e.target.value,
                })
              }
              size="small"
              InputLabelProps={{ sx: { color: "#111827" } }}
              InputProps={{ sx: { color: "#111827" } }}
            />
            {!!assignError && (
              <Typography color="error">{assignError}</Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => assign.mutate(assignForm)}
            disabled={
              assign.isPending ||
              !assignForm.assetCode ||
              !assignForm.employeeId
            }
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
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      <Paper sx={{ p: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          sx={{ mb: 2, alignItems: "center", gap: 2 }}
        >
          <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
            {/* Active Button */}
            <Button
              variant="outlined"
              size="small"
              onClick={() => setFilters((f) => ({ ...f, status: "active" }))}
              sx={{
                ...(filters.status === "active"
                  ? {
                      backgroundColor: "white",
                      color: "#6a732c",
                      border: "1px solid #6a732c",
                      "&:hover": {
                        backgroundColor: "white",
                        color: "#6a732c",
                        border: "1px solid #6a732c",
                      },
                    }
                  : {
                      backgroundColor: "#6a732c",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#6a732c",
                      },
                    }),
                boxShadow: "none",
                "&:active": { boxShadow: "none" },
              }}
            >
              Active
            </Button>

            {/* History Button */}
            <Button
              variant="outlined"
              size="small"
              onClick={() =>
                setFilters((f) => ({ ...f, status: "returned,retired" }))
              }
              sx={{
                ...(filters.status === "returned,retired"
                  ? {
                      backgroundColor: "white",
                      color: "#6a732c",
                      border: "1px solid #6a732c",
                      "&:hover": {
                        backgroundColor: "white",
                        color: "#6a732c",
                        border: "1px solid #6a732c",
                      },
                    }
                  : {
                      backgroundColor: "#6a732c",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#6a732c",
                      },
                    }),
                boxShadow: "none",
                "&:active": { boxShadow: "none" },
              }}
            >
              History
            </Button>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            sx={{ width: { xs: "100%", md: "auto" } }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0,
                width: "100%",
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <TextField
                select
                size="small"
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                sx={{
                  minWidth: 190,
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                }}
                placeholder="Search by"
              >
                {selectOptions.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
              <Divider orientation="vertical" flexItem />
              <TextField
                fullWidth
                placeholder={
                  searchField === "assignedDate" ||
                  searchField === "returnedDate"
                    ? "Select date"
                    : "Enter value"
                }
                type={
                  searchField === "assignedDate" ||
                  searchField === "returnedDate"
                    ? "date"
                    : "text"
                }
                InputLabelProps={{ shrink: false }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                disabled={searchField === "none"}
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    doSearch();
                  }
                }}
              />
            </Box>
            <Button variant="outlined" onClick={doSearch}>
              Search
            </Button>
          </Stack>
        </Stack>

        {isLoading ? (
          "Loading..."
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Assignment ID</TableCell>
                <TableCell>Asset ID</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Brand/Model</TableCell>
                <TableCell>Employee</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned At</TableCell>
                <TableCell>Returned At</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data?.data || []).map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.id}</TableCell>
                  <TableCell>{a?.asset?.assetId || a.assetId}</TableCell>
                  <TableCell>{a?.asset?.assetType || "-"}</TableCell>
                  <TableCell>
                    {[a?.asset?.brand, a?.asset?.model]
                      .filter(Boolean)
                      .join(" ") || "-"}
                  </TableCell>
                  <TableCell>
                    {a?.employee?.name
                      ? `${a.employee.name} (${a.employee.employee_id})`
                      : a.employeeId}
                  </TableCell>
                  <TableCell>
                    {String(a?.status || "").toLowerCase() === "retired" ? (
                      <Typography color="warning.main" fontWeight={600}>
                        retired
                      </Typography>
                    ) : (
                      a.status
                    )}
                  </TableCell>
                  <TableCell>
                    {a.assignedAt
                      ? new Date(a.assignedAt).toLocaleString()
                      : ""}
                  </TableCell>
                  <TableCell>
                    {a.returnedAt
                      ? new Date(a.returnedAt).toLocaleString()
                      : ""}
                  </TableCell>
                  <TableCell>
                    {a.status === "active" ? (
                      <Button
                        size="small"
                        onClick={() => {
                          setSelected(a);
                          setReturnForm({
                            notes: a.notes || "",
                            conditionOnReturn: a.conditionOnReturn || "",
                            retired: false,
                            retireReason: "",
                          });
                          setOpenReturn(true);
                        }}
                      >
                        Return
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        onClick={() => {
                          setSelected(a);
                          setViewForm({
                            notes: a.notes || "",
                            conditionOnReturn: a.conditionOnReturn || "",
                            retired: !!a.retired,
                            retireReason: a.retireReason || "",
                          });
                          setViewEditMode(false);
                          setOpenView(true);
                        }}
                      >
                        View
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Return modal */}
      <Dialog
        open={openReturn}
        onClose={() => setOpenReturn(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Return Asset</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2">
              Provide return notes and condition. If the asset is
              broken/obsolete, mark it as retired.
            </Typography>
            <TextField
              label="Notes"
              value={returnForm.notes}
              onChange={(e) =>
                setReturnForm((v) => ({ ...v, notes: e.target.value }))
              }
              size="small"
              multiline
              minRows={3}
              InputLabelProps={{ sx: { color: "#111827" } }}
              InputProps={{ sx: { color: "#111827" } }}
            />
            <TextField
              label="Condition on Return"
              value={returnForm.conditionOnReturn}
              onChange={(e) =>
                setReturnForm((v) => ({
                  ...v,
                  conditionOnReturn: e.target.value,
                }))
              }
              size="small"
              InputLabelProps={{ sx: { color: "#111827" } }}
              InputProps={{ sx: { color: "#111827" } }}
            />
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant={returnForm.retired ? "contained" : "outlined"}
                color={"error"}
                size="small"
                onClick={() =>
                  setReturnForm((v) => ({ ...v, retired: !v.retired }))
                }
                sx={{
                  ...(returnForm.retired && {
                    backgroundColor: "white",
                    color: "error.main",
                    border: "1px solid",
                    borderColor: "error.main",
                    "&:hover": {
                      backgroundColor: "white",
                      color: "error.dark",
                      borderColor: "error.dark",
                    },
                  }),
                }}
              >
                {returnForm.retired ? "Marked as Retired" : "Mark as Retired"}
              </Button>
              <TextField
                label="Retire reason"
                size="small"
                value={returnForm.retireReason}
                onChange={(e) =>
                  setReturnForm((v) => ({ ...v, retireReason: e.target.value }))
                }
                placeholder="e.g., Broken screen, lost key, obsolete"
                sx={{ flex: 1 }}
                InputLabelProps={{ sx: { color: "#111827" } }}
                InputProps={{ sx: { color: "#111827" } }}
                disabled={!returnForm.retired}
                required={returnForm.retired}
                error={
                  returnForm.retired && !(returnForm.retireReason || "").trim()
                }
                helperText={
                  returnForm.retired && !(returnForm.retireReason || "").trim()
                    ? "Retire reason is required when marking as retired"
                    : undefined
                }
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReturn(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => ret.mutate({ id: selected.id, payload: returnForm })}
            disabled={
              ret.isPending ||
              (returnForm.retired && !(returnForm.retireReason || "").trim())
            }
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
            Submit & Return
          </Button>
        </DialogActions>
      </Dialog>

      {/* View/Edit returned modal */}
      <Dialog
        open={openView}
        onClose={() => setOpenView(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Assignment Details</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Notes"
              value={viewForm.notes}
              onChange={(e) =>
                setViewForm((v) => ({ ...v, notes: e.target.value }))
              }
              size="small"
              multiline
              minRows={3}
              disabled={!viewEditMode}
              InputLabelProps={{ sx: { color: "#111827" } }}
              InputProps={{
                sx: {
                  color: "#111827",
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "#111827",
                    color: "#111827",
                  },
                },
              }}
            />
            <TextField
              label="Condition on Return"
              value={viewForm.conditionOnReturn}
              onChange={(e) =>
                setViewForm((v) => ({
                  ...v,
                  conditionOnReturn: e.target.value,
                }))
              }
              size="small"
              disabled={!viewEditMode}
              InputLabelProps={{ sx: { color: "#111827" } }}
              InputProps={{
                sx: {
                  color: "#111827",
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "#111827",
                    color: "#111827",
                  },
                },
              }}
            />
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant={viewForm.retired ? "contained" : "outlined"}
                color={"error"}
                size="small"
                disabled={!viewEditMode}
                onClick={() =>
                  setViewForm((v) => ({ ...v, retired: !v.retired }))
                }
              >
                {viewForm.retired ? "Marked as Retired" : "Mark as Retired"}
              </Button>
              <TextField
                label="Retire reason"
                size="small"
                value={viewForm.retireReason}
                onChange={(e) =>
                  setViewForm((v) => ({ ...v, retireReason: e.target.value }))
                }
                placeholder="e.g., Broken, obsolete"
                disabled={!viewEditMode || !viewForm.retired}
                sx={{ flex: 1 }}
                InputLabelProps={{ sx: { color: "#111827" } }}
                InputProps={{ sx: { color: "#111827" } }}
                required={viewForm.retired}
                error={
                  viewEditMode &&
                  viewForm.retired &&
                  !(viewForm.retireReason || "").trim()
                }
                helperText={
                  viewEditMode &&
                  viewForm.retired &&
                  !(viewForm.retireReason || "").trim()
                    ? "Retire reason is required when marking as retired"
                    : undefined
                }
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          {!viewEditMode ? (
            <>
              <Button onClick={() => setOpenView(false)}>Close</Button>
              <Button variant="outlined" onClick={() => setViewEditMode(true)}>
                Edit
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => {
                  setViewEditMode(false);
                  setOpenView(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={() =>
                  updateReturned.mutate({ id: selected.id, payload: viewForm })
                }
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
                disabled={
                  viewEditMode &&
                  viewForm.retired &&
                  !(viewForm.retireReason || "").trim()
                }
              >
                Save
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
