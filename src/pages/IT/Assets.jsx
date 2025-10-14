import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listAssets, createAsset } from "../../api/endpoints";
import {
  Box,
  Stack,
  Typography,
  Button,
  TextField,
  MenuItem,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

export default function ITAssets() {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);
  // Search state
  const [searchField, setSearchField] = React.useState("assetId");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filters, setFilters] = React.useState({});
  const [form, setForm] = React.useState({
    assetId: "",
    serialNumber: "",
    assetType: "laptop",
    typeDetail: "",
    brand: "",
    model: "",
    cpu: "",
    ram: "",
    storage: "",
    os: "",
    gpu: "",
    purchaseDate: "",
    warrantyExpiry: "",
    location: "",
    status: "active",
  });

  const runSearch = React.useCallback(() => {
    const q = searchQuery.trim();
    if (searchField === "none" || !q) {
      setFilters({});
      setSearchQuery("");
      qc.invalidateQueries({ queryKey: ["assets"] });
      return;
    }
    // Backend supports: q (searches assetId/serialNumber/model/brand), assetType, status
    let next = {};
    if (["assetId", "serialNumber", "brand", "model"].includes(searchField)) {
      next = { q };
    } else if (["assetType", "status"].includes(searchField)) {
      next = { [searchField]: q };
    } else {
      // Fallback to q for unknown fields
      next = { q };
    }
    setFilters(next);
    qc.invalidateQueries({ queryKey: ["assets"] });
  }, [searchField, searchQuery, qc]);
  const { data, isLoading } = useQuery({
    queryKey: ["assets", { page: 1, filters }],
    queryFn: () => listAssets({ page: 1, pageSize: 20, ...filters }),
  });
  const create = useMutation({
    mutationFn: (payload) => createAsset(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assets"] });
      setForm({
        assetId: "",
        serialNumber: "",
        assetType: "laptop",
        typeDetail: "",
        brand: "",
        model: "",
        cpu: "",
        ram: "",
        storage: "",
        os: "",
        gpu: "",
        purchaseDate: "",
        warrantyExpiry: "",
        location: "",
        status: "active",
      });
      setOpen(false);
    },
  });

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5">IT Assets</Typography>
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
          }}
        >
          Asset +
        </Button>
      </Stack>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Create Asset</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Asset ID"
                value={form.assetId}
                onChange={(e) => setForm({ ...form, assetId: e.target.value })}
                size="small"
                required
              />
              <TextField
                label="Serial Number"
                value={form.serialNumber}
                onChange={(e) =>
                  setForm({ ...form, serialNumber: e.target.value })
                }
                size="small"
                required
              />
              <TextField
                select
                label="Type"
                value={form.assetType}
                onChange={(e) =>
                  setForm({ ...form, assetType: e.target.value })
                }
                size="small"
                sx={{ minWidth: 160 }}
              >
                {["laptop", "mouse", "keyboard", "stand", "other"].map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>
              {form.assetType === "other" && (
                <TextField
                  label="Type detail"
                  value={form.typeDetail}
                  onChange={(e) =>
                    setForm({ ...form, typeDetail: e.target.value })
                  }
                  size="small"
                />
              )}
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Brand"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                size="small"
              />
              <TextField
                label="Model"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                size="small"
              />
              <TextField
                label="Location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                size="small"
              />
            </Stack>
            {form.assetType === "laptop" && (
              <>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    label="CPU"
                    value={form.cpu}
                    onChange={(e) => setForm({ ...form, cpu: e.target.value })}
                    size="small"
                  />
                  <TextField
                    label="RAM"
                    value={form.ram}
                    onChange={(e) => setForm({ ...form, ram: e.target.value })}
                    size="small"
                  />
                  <TextField
                    label="Storage"
                    value={form.storage}
                    onChange={(e) =>
                      setForm({ ...form, storage: e.target.value })
                    }
                    size="small"
                  />
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    label="OS"
                    value={form.os}
                    onChange={(e) => setForm({ ...form, os: e.target.value })}
                    size="small"
                  />
                  <TextField
                    label="GPU"
                    value={form.gpu}
                    onChange={(e) => setForm({ ...form, gpu: e.target.value })}
                    size="small"
                  />
                </Stack>
              </>
            )}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                type="date"
                label="Purchase Date"
                InputLabelProps={{ shrink: true }}
                value={form.purchaseDate}
                onChange={(e) =>
                  setForm({ ...form, purchaseDate: e.target.value })
                }
                size="small"
              />
              <TextField
                type="date"
                label="Warranty Expiry"
                InputLabelProps={{ shrink: true }}
                value={form.warrantyExpiry}
                onChange={(e) =>
                  setForm({ ...form, warrantyExpiry: e.target.value })
                }
                size="small"
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => create.mutate(form)}
            disabled={create.isPending || !form.assetId || !form.serialNumber}
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

      <Typography variant="subtitle1" gutterBottom>
        Latest Assets
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1}
          alignItems="center"
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
              <MenuItem value="none">All</MenuItem>
              <MenuItem value="assetId">Asset ID</MenuItem>
              <MenuItem value="serialNumber">Serial</MenuItem>
              <MenuItem value="assetType">Type</MenuItem>
              <MenuItem value="brand">Brand</MenuItem>
              <MenuItem value="model">Model</MenuItem>
              <MenuItem value="status">Status</MenuItem>
            </TextField>
            <Divider orientation="vertical" flexItem />
            <TextField
              fullWidth
              placeholder="Enter value"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={searchField === "none"}
              sx={{ "& .MuiOutlinedInput-notchedOutline": { border: "none" } }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  runSearch();
                }
              }}
              autoComplete="off"
              InputLabelProps={{ shrink: false }}
            />
          </Box>
          <Button variant="outlined" onClick={runSearch}>
            Search
          </Button>
        </Stack>
      </Paper>

      {isLoading ? (
        "Loading..."
      ) : (
        <Paper sx={{ p: 1 }}>
          <Box sx={{ width: "100%" }}>
            <DataGrid
              rows={data?.data || []}
              getRowId={(row) => row.id}
              columns={[
                { field: "assetId", headerName: "Asset ID", width: 150 },
                { field: "serialNumber", headerName: "Serial", width: 160 },
                { field: "assetType", headerName: "Type", width: 140 },
                { field: "brand", headerName: "Brand", width: 160 },
                { field: "model", headerName: "Model", width: 180 },
                {
                  field: "status",
                  headerName: "Status",
                  width: 140,
                  renderCell: (params) => {
                    const s = String(params.value || "");
                    const color =
                      s === "assigned"
                        ? "error.main"
                        : s === "active"
                        ? "success.main"
                        : s === "retired"
                        ? "warning.main"
                        : "inherit";
                    const label = s === "assigned" ? "Assigned" : s;
                    return (
                      <Typography
                        sx={{
                          color,
                          fontWeight: [
                            "assigned",
                            "active",
                            "retired",
                          ].includes(s)
                            ? 600
                            : 400,
                        }}
                      >
                        {label}
                      </Typography>
                    );
                  },
                },
              ]}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              autoHeight
              disableRowSelectionOnClick
              density="compact"
              sx={{
                mx: 1,
                border: 0,
                "& .MuiDataGrid-columnHeader:first-of-type": { pl: 2 },
                "& .MuiDataGrid-cell:first-of-type": { pl: 2 },
                "& .MuiDataGrid-columnHeaderTitle": { overflow: "visible" },
              }}
            />
          </Box>
        </Paper>
      )}
    </Box>
  );
}
