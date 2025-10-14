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
            <Grid container spacing={2}>
              {openFlags.map((f) => (
                <Grid item xs={12} md={6} key={f.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={700}>
                        Product #{f.product_id}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {f.reason}
                      </Typography>
                      <Stack spacing={1}>
                        <TextField
                          size="small"
                          placeholder="Admin notes"
                          value={noteMap[f.id] || ""}
                          onChange={(e) =>
                            setNoteMap((m) => ({
                              ...m,
                              [f.id]: e.target.value,
                            }))
                          }
                        />
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() =>
                              resolve.mutate({
                                id: f.id,
                                action: "received",
                                adminNotes: noteMap[f.id] || "",
                              })
                            }
                          >
                            Mark Received
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() =>
                              resolve.mutate({
                                id: f.id,
                                action: "keep",
                                adminNotes: noteMap[f.id] || "",
                              })
                            }
                          >
                            Keep
                          </Button>
                          <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() =>
                              resolve.mutate({
                                id: f.id,
                                action: "remove",
                                adminNotes: noteMap[f.id] || "",
                              })
                            }
                          >
                            Remove
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {!openFlags.length && (
                <Grid item xs={12}>
                  <Typography color="text.secondary">No open flags.</Typography>
                </Grid>
              )}
            </Grid>
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
            <Grid container spacing={2}>
              {(receivedFlags || []).map((f) => (
                <Grid item xs={12} md={6} key={f.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={700}>
                        Product #{f.product_id}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {f.reason}
                      </Typography>
                      <Stack spacing={1}>
                        <TextField
                          size="small"
                          placeholder="Admin notes"
                          value={noteMap[f.id] || ""}
                          onChange={(e) =>
                            setNoteMap((m) => ({
                              ...m,
                              [f.id]: e.target.value,
                            }))
                          }
                        />
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="outlined"
                            onClick={() =>
                              resolve.mutate({
                                id: f.id,
                                action: "keep",
                                adminNotes: noteMap[f.id] || "",
                              })
                            }
                          >
                            Keep
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() =>
                              resolve.mutate({
                                id: f.id,
                                action: "remove",
                                adminNotes: noteMap[f.id] || "",
                              })
                            }
                          >
                            Remove
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {!receivedFlags.length && (
                <Grid item xs={12}>
                  <Typography color="text.secondary">
                    No received flags.
                  </Typography>
                </Grid>
              )}
            </Grid>
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
            <Grid container spacing={2}>
              {(keptFlags || []).map((f) => (
                <Grid item xs={12} md={6} key={f.id}>
                  <Card>
                    <CardContent>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="subtitle1" fontWeight={700}>
                          Product #{f.product_id}
                        </Typography>
                        <Chip label="Kept" color="success" size="small" />
                      </Stack>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {f.reason}
                      </Typography>
                      <TextField
                        size="small"
                        placeholder="Admin notes"
                        value={noteMap[f.id] || ""}
                        onChange={(e) =>
                          setNoteMap((m) => ({ ...m, [f.id]: e.target.value }))
                        }
                      />
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() =>
                            resolve.mutate({
                              id: f.id,
                              action: "remove",
                              adminNotes: noteMap[f.id] || "",
                            })
                          }
                        >
                          Remove
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {!keptFlags.length && (
                <Grid item xs={12}>
                  <Typography color="text.secondary">No kept flags.</Typography>
                </Grid>
              )}
            </Grid>
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
            <Grid container spacing={2}>
              {(removedFlags || []).map((f) => (
                <Grid item xs={12} md={6} key={f.id}>
                  <Card>
                    <CardContent>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="subtitle1" fontWeight={700}>
                          Product #{f.product_id}
                        </Typography>
                        <Chip label="Removed" color="error" size="small" />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {f.reason}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {!removedFlags.length && (
                <Grid item xs={12}>
                  <Typography color="text.secondary">
                    No removed flags.
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}
