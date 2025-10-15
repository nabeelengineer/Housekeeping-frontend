import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listFlags, resolveFlag } from "../../api/endpoints";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Stack,
  TextField,
  Divider,
  Chip,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function useFlags(status = "open") {
  return useQuery({
    queryKey: ["flags", status],
    queryFn: () => listFlags({ status }),
  });
}

export default function BuySellModeration() {
  const qc = useQueryClient();
  const { data: openFlags = [], isLoading: loadingOpen } = useFlags("open");
  const { data: receivedFlags = [], isLoading: loadingReceived } =
    useFlags("received");
  const { data: keptFlags = [], isLoading: loadingKept } = useFlags("kept");
  const { data: removedFlags = [], isLoading: loadingRemoved } =
    useFlags("removed");
  const [noteMap, setNoteMap] = React.useState({});
  const resolve = useMutation({
    mutationFn: ({ id, action, adminNotes }) =>
      resolveFlag(id, { action, adminNotes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["flags", "open"] });
      qc.invalidateQueries({ queryKey: ["flags", "received"] });
      qc.invalidateQueries({ queryKey: ["flags", "kept"] });
      qc.invalidateQueries({ queryKey: ["flags", "removed"] });
    },
  });

  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      <Accordion defaultExpanded sx={{ boxShadow: "none" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={700}>
            Open Flags ({openFlags.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {loadingOpen ? (
            <Typography>Loading...</Typography>
          ) : (
            <Box sx={{ width: "100%" }}>
              <DataGrid
                rows={openFlags}
                getRowId={(row) => row.id}
                columns={[
                  { field: "product_id", headerName: "Product", width: 140, valueGetter: (_v, r) => `#${r.product_id}` },
                  { field: "reason", headerName: "Reason", flex: 1, minWidth: 220 },
                  {
                    field: "adminNotes",
                    headerName: "Notes",
                    flex: 1,
                    minWidth: 200,
                    sortable: false,
                    filterable: false,
                    renderCell: (params) => (
                      <TextField
                        size="small"
                        placeholder="Admin notes"
                        value={noteMap[params.row.id] || ""}
                        onChange={(e) =>
                          setNoteMap((m) => ({ ...m, [params.row.id]: e.target.value }))
                        }
                        fullWidth
                        sx={{
                          '& .MuiInputBase-root': { height: 32 },
                          '& input::placeholder': { opacity: 0.8 },
                          backgroundColor: 'background.paper',
                        }}
                      />
                    ),
                  },
                  {
                    field: "actions",
                    headerName: "Actions",
                    width: 320,
                    sortable: false,
                    filterable: false,
                    renderCell: (params) => (
                      <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            resolve.mutate({
                              id: params.row.id,
                              action: "received",
                              adminNotes: noteMap[params.row.id] || "",
                            })
                          }
                          sx={{ textTransform: 'none', boxShadow: 'none' }}
                        >
                          Mark Received
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() =>
                            resolve.mutate({
                              id: params.row.id,
                              action: "keep",
                              adminNotes: noteMap[params.row.id] || "",
                            })
                          }
                          sx={{ textTransform: 'none', boxShadow: 'none', backgroundColor: 'primary.main' }}
                        >
                          Keep
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() =>
                            resolve.mutate({
                              id: params.row.id,
                              action: "remove",
                              adminNotes: noteMap[params.row.id] || "",
                            })
                          }
                          sx={{ textTransform: 'none', boxShadow: 'none' }}
                        >
                          Remove
                        </Button>
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
                  '& .MuiDataGrid-columnHeaders': { backgroundColor: 'grey.50' },
                  '& .MuiDataGrid-cell': { alignItems: 'center' },
                }}
                slots={{
                  noRowsOverlay: () => (
                    <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                      <Typography>No open flags.</Typography>
                    </Box>
                  ),
                }}
              />
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded sx={{ boxShadow: "none" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={700}>
            Received Flags ({receivedFlags.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {loadingReceived ? (
            <Typography>Loading...</Typography>
          ) : (
            <Box sx={{ width: "100%" }}>
              <DataGrid
                rows={receivedFlags || []}
                getRowId={(row) => row.id}
                columns={[
                  { field: "product_id", headerName: "Product", width: 140, valueGetter: (_v, r) => `#${r.product_id}` },
                  { field: "reason", headerName: "Reason", flex: 1, minWidth: 220 },
                  {
                    field: "adminNotes",
                    headerName: "Notes",
                    flex: 1,
                    minWidth: 200,
                    sortable: false,
                    filterable: false,
                    renderCell: (params) => (
                      <TextField
                        size="small"
                        placeholder="Admin notes"
                        value={noteMap[params.row.id] || ""}
                        onChange={(e) =>
                          setNoteMap((m) => ({ ...m, [params.row.id]: e.target.value }))
                        }
                        fullWidth
                        sx={{
                          '& .MuiInputBase-root': { height: 32 },
                          '& input::placeholder': { opacity: 0.8 },
                          backgroundColor: 'background.paper',
                        }}
                      />
                    ),
                  },
                  {
                    field: "actions",
                    headerName: "Actions",
                    width: 240,
                    sortable: false,
                    filterable: false,
                    renderCell: (params) => (
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() =>
                            resolve.mutate({
                              id: params.row.id,
                              action: "keep",
                              adminNotes: noteMap[params.row.id] || "",
                            })
                          }
                          sx={{ textTransform: 'none', boxShadow: 'none', backgroundColor: 'primary.main' }}
                        >
                          Keep
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() =>
                            resolve.mutate({
                              id: params.row.id,
                              action: "remove",
                              adminNotes: noteMap[params.row.id] || "",
                            })
                          }
                          sx={{ textTransform: 'none', boxShadow: 'none' }}
                        >
                          Remove
                        </Button>
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
                  '& .MuiDataGrid-columnHeaders': { backgroundColor: 'grey.50' },
                  '& .MuiDataGrid-cell': { alignItems: 'center' },
                }}
                slots={{
                  noRowsOverlay: () => (
                    <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                      <Typography>No received flags.</Typography>
                    </Box>
                  ),
                }}
              />
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ boxShadow: "none" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={700}>
            Kept Flags ({keptFlags.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {loadingKept ? (
            <Typography>Loading...</Typography>
          ) : (
            <Box sx={{ width: "100%" }}>
              <DataGrid
                rows={keptFlags || []}
                getRowId={(row) => row.id}
                columns={[
                  { field: "product_id", headerName: "Product", width: 140, valueGetter: (_v, r) => `#${r.product_id}` },
                  { field: "reason", headerName: "Reason", flex: 1, minWidth: 220 },
                  { field: "status", headerName: "Status", width: 120, renderCell: () => <Chip label="Kept" color="success" size="small" /> },
                  {
                    field: "adminNotes",
                    headerName: "Notes",
                    flex: 1,
                    minWidth: 200,
                    sortable: false,
                    filterable: false,
                    renderCell: (params) => (
                      <TextField
                        size="small"
                        placeholder="Admin notes"
                        value={noteMap[params.row.id] || ""}
                        onChange={(e) =>
                          setNoteMap((m) => ({ ...m, [params.row.id]: e.target.value }))
                        }
                        fullWidth
                        sx={{
                          '& .MuiInputBase-root': { height: 32 },
                          '& input::placeholder': { opacity: 0.8 },
                          backgroundColor: 'background.paper',
                        }}
                      />
                    ),
                  },
                  {
                    field: "actions",
                    headerName: "Actions",
                    width: 160,
                    sortable: false,
                    filterable: false,
                    renderCell: (params) => (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() =>
                          resolve.mutate({
                            id: params.row.id,
                            action: "remove",
                            adminNotes: noteMap[params.row.id] || "",
                          })
                        }
                        sx={{ textTransform: 'none', boxShadow: 'none' }}
                      >
                        Remove
                      </Button>
                    ),
                  },
                ]}
                pageSizeOptions={[5, 10, 25]}
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                autoHeight
                disableRowSelectionOnClick
                density="compact"
                sx={{
                  '& .MuiDataGrid-columnHeaders': { backgroundColor: 'grey.50' },
                  '& .MuiDataGrid-cell': { alignItems: 'center' },
                }}
                slots={{
                  noRowsOverlay: () => (
                    <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                      <Typography>No kept flags.</Typography>
                    </Box>
                  ),
                }}
              />
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ boxShadow: "none" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={700}>
            Removed Flags ({removedFlags.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {loadingRemoved ? (
            <Typography>Loading...</Typography>
          ) : (
            <Box sx={{ width: "100%" }}>
              <DataGrid
                rows={removedFlags || []}
                getRowId={(row) => row.id}
                columns={[
                  { field: "product_id", headerName: "Product", width: 140, valueGetter: (_v, r) => `#${r.product_id}` },
                  { field: "reason", headerName: "Reason", flex: 1, minWidth: 220 },
                  { field: "status", headerName: "Status", width: 140, renderCell: () => <Chip label="Removed" color="error" size="small" /> },
                ]}
                pageSizeOptions={[5, 10, 25]}
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                autoHeight
                disableRowSelectionOnClick
                density="compact"
                sx={{
                  '& .MuiDataGrid-columnHeaders': { backgroundColor: 'grey.50' },
                  '& .MuiDataGrid-cell': { alignItems: 'center' },
                }}
                slots={{
                  noRowsOverlay: () => (
                    <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                      <Typography>No removed flags.</Typography>
                    </Box>
                  ),
                }}
              />
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}
