import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  listAdminLogs,
  getAssetsSummary,
  listAssignments,
  listAssets,
} from "../../api/endpoints";
import {
  Box,
  Stack,
  Typography,
  Paper,
  Button,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Divider,
  TextField,
} from "@mui/material";

export default function ITLogs() {
  const [tab, setTab] = React.useState("ASSIGN_ASSET");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(20);
  // Per-tab search boxes
  const [searchCreated, setSearchCreated] = React.useState("");
  const [searchAssigned, setSearchAssigned] = React.useState("");
  const [searchReturned, setSearchReturned] = React.useState("");
  const [searchRetired, setSearchRetired] = React.useState("");
  // Some backends log retirement as RETURN_ASSET with metadata.retired=true.
  // Map the RETIRE_ASSET tab to request RETURN_ASSET and filter client-side.
  const params = React.useMemo(() => {
    const actionParam = tab === "RETIRE_ASSET" ? "RETURN_ASSET" : tab;
    return { page: page + 1, pageSize: rowsPerPage, action: actionParam };
  }, [page, rowsPerPage, tab]);
  const logsQuery = useQuery({
    queryKey: ["adminLogs", params],
    queryFn: () => listAdminLogs(params),
  });
  // Retired tab uses retired assets to keep numbers aligned with the summary
  const retiredAssetsQuery = useQuery({
    queryKey: ["retiredAssets", { page, rowsPerPage }],
    queryFn: () =>
      listAssets({ status: "retired", page: page + 1, pageSize: rowsPerPage }),
    enabled: tab === "RETIRE_ASSET",
  });
  // Fetch retired assignments (for employee and reason)
  const retiredAssignsQuery = useQuery({
    queryKey: ["retiredAssigns", { tab }],
    queryFn: () => listAssignments({ retired: true, page: 1, pageSize: 1000 }),
    enabled: tab === "RETIRE_ASSET",
  });
  const summaryQuery = useQuery({
    queryKey: ["assetsSummary"],
    queryFn: () => getAssetsSummary(),
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: false,
  });

  const logs = logsQuery.data?.data || [];
  const retiredRows = retiredAssetsQuery.data?.data || [];
  const retiredAssigns = retiredAssignsQuery.data?.data || [];
  const retiredByAssetCode = React.useMemo(() => {
    const map = new Map();
    for (const a of retiredAssigns) {
      const key = a?.asset?.assetId || a.assetId;
      if (key && !map.has(key)) map.set(key, a);
    }
    return map;
  }, [retiredAssigns]);
  const total =
    tab === "RETIRE_ASSET"
      ? summaryQuery.data?.retired ?? retiredRows.length
      : logsQuery.data?.total || 0;

  // If total > 0 but current page came back empty (e.g., after count change), reset to first page
  React.useEffect(() => {
    if (
      tab === "RETIRE_ASSET" &&
      retiredRows.length === 0 &&
      total > 0 &&
      page > 0
    ) {
      setPage(0);
    }
  }, [tab, retiredRows.length, total, page]);

  // Always refetch summary when switching tabs to avoid stale counts
  React.useEffect(() => {
    summaryQuery.refetch();
  }, [tab]);

  const safeMeta = (raw) => {
    if (!raw) return {};
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw);
      } catch {
        return {};
      }
    }
    return raw;
  };

  const downloadCsv = () => {
    // fetch a larger page to export (up to 1000 rows)
    const exportParams = {
      page: 1,
      pageSize: Math.max(rowsPerPage, 1000),
      action: tab,
    };
    listAdminLogs(exportParams).then((res) => {
      const rows = res?.data || [];
      let headers = ["createdAt", "action", "entityType", "entityId", "userId"];
      if (tab === "ASSIGN_ASSET")
        headers = [
          "createdAt",
          "assetCode",
          "employeeId",
          "employeeName",
          "assignedAt",
          "assignedBy",
        ];
      if (tab === "RETURN_ASSET")
        headers = [
          "createdAt",
          "assetCode",
          "employeeId",
          "employeeName",
          "returnedAt",
          "returnedBy",
        ];
      if (tab === "CREATE_ASSET")
        headers = [
          "createdAt",
          "assetId",
          "assetType",
          "brand",
          "model",
          "status",
        ];
      if (tab === "RETIRE_ASSET")
        headers = ["updatedAt", "assetCode", "assetType", "brand", "model"];
      const csv = [headers.join(",")]
        .concat(
          rows
            .map((r) => {
              const m = safeMeta(r.metadata);
              if (tab === "ASSIGN_ASSET") {
                return [
                  new Date(r.createdAt).toISOString(),
                  m.assetCode || m.assetId || r.entityId,
                  m.employeeId,
                  m.employeeName,
                  m.assignedAt,
                  m.assignedBy,
                ];
              }
              if (tab === "RETURN_ASSET") {
                return [
                  new Date(r.createdAt).toISOString(),
                  m.assetCode || m.assetId || r.entityId,
                  m.employeeId,
                  m.employeeName,
                  m.returnedAt,
                  m.returnedBy,
                ];
              }
              if (tab === "CREATE_ASSET") {
                return [
                  new Date(r.createdAt).toISOString(),
                  m.assetId || r.entityId,
                  m.assetType,
                  m.brand,
                  m.model,
                  m.status,
                ];
              }
              if (tab === "RETIRE_ASSET") {
                // Export retired assets list
                return [
                  new Date(
                    r.updatedAt || r.createdAt || Date.now()
                  ).toISOString(),
                  r?.asset?.assetId || r.assetId,
                  r?.asset?.assetType || r.assetType,
                  r?.asset?.brand || r.brand,
                  r?.asset?.model || r.model,
                ];
              }
              return [
                new Date(r.createdAt).toISOString(),
                r.action,
                r.entityType,
                r.entityId,
                r.userId,
              ];
            })
            .map((row) =>
              row
                .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
                .join(",")
            )
        )
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `it_logs_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const renderEntity = (log) => {
    const m = safeMeta(log?.metadata);
    if (log.action === "ASSIGN_ASSET") {
      const what = m.assetCode || m.assetId || log.entityId;
      // Only show the action + asset here; employee/time are shown in separate columns
      return `Assigned ${what}`;
    }
    if (log.action === "RETURN_ASSET") {
      const what = m.assetCode || m.assetId || log.entityId;
      // Only show the action + asset here; employee/time are shown in separate columns
      return `Returned ${what}`;
    }
    if (log.action === "CREATE_ASSET") {
      const what = m.assetId || log.entityId;
      return `Created asset ${what}`;
    }
    if (log.action === "UPDATE_ASSET") {
      const what = m.assetId || log.entityId;
      return `Updated asset ${what}`;
    }
    if (log.action === "UPDATE_RETURN_DETAILS") {
      return `Updated return details for ${log.entityType} • ${log.entityId}`;
    }
    if (log.action === "RETIRE_ASSET") {
      const what = m.assetCode || m.assetId || log.entityId;
      return `Retired ${what}`;
    }
    // Fallback
    return `${log.entityType} • ${log.entityId}`;
  };

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
          IT Admin Logs
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={async () => {
              const max = 5000;
              const [created, assigned, returned, retired] = await Promise.all([
                listAdminLogs({
                  page: 1,
                  pageSize: max,
                  action: "CREATE_ASSET",
                }),
                listAdminLogs({
                  page: 1,
                  pageSize: max,
                  action: "ASSIGN_ASSET",
                }),
                listAdminLogs({
                  page: 1,
                  pageSize: max,
                  action: "RETURN_ASSET",
                }),
                listAssignments({
                  status: "returned",
                  retired: true,
                  page: 1,
                  pageSize: max,
                }),
              ]);
              const rows = {
                created: created?.data || [],
                assigned: assigned?.data || [],
                returned: returned?.data || [],
                retired: retired?.data || [],
              };
              const dt = new Date().toISOString().slice(0, 10);
              const mod = await import("xlsx").catch(() => null);
              if (!mod) {
                alert(
                  "Excel export requires the xlsx package. Please run: npm install xlsx"
                );
                return;
              }
              const XLSX = mod.default || mod;
              const wb = XLSX.utils.book_new();
              const m = (raw) => safeMeta(raw);
              const toRows = (arr, headers, mapFn) => {
                const data = arr.map((r) => mapFn(r));
                const objs = data.map((row) =>
                  Object.fromEntries(headers.map((k, i) => [k, row[i]]))
                );
                return XLSX.utils.json_to_sheet(objs, { header: headers });
              };
              const wsCreated = toRows(
                rows.created,
                [
                  "createdAt",
                  "assetId",
                  "assetType",
                  "brand",
                  "model",
                  "status",
                ],
                (r) => {
                  const meta = m(r.metadata);
                  return [
                    new Date(r.createdAt).toISOString(),
                    meta.assetId || r.entityId,
                    (meta.assetType || "").toString().toUpperCase(),
                    meta.brand,
                    meta.model,
                    meta.status,
                  ];
                }
              );
              const wsAssigned = toRows(
                rows.assigned,
                [
                  "createdAt",
                  "assetCode",
                  "employeeId",
                  "employeeName",
                  "assignedAt",
                  "assignedBy",
                ],
                (r) => {
                  const meta = m(r.metadata);
                  return [
                    new Date(r.createdAt).toISOString(),
                    meta.assetCode || meta.assetId || r.entityId,
                    meta.employeeId,
                    meta.employeeName,
                    meta.assignedAt,
                    meta.assignedBy,
                  ];
                }
              );
              const wsReturned = toRows(
                rows.returned,
                [
                  "createdAt",
                  "assetCode",
                  "employeeId",
                  "employeeName",
                  "returnedAt",
                  "returnedBy",
                ],
                (r) => {
                  const meta = m(r.metadata);
                  return [
                    new Date(r.createdAt).toISOString(),
                    meta.assetCode || meta.assetId || r.entityId,
                    meta.employeeId,
                    meta.employeeName,
                    meta.returnedAt,
                    meta.returnedBy,
                  ];
                }
              );
              const wsRetired = toRows(
                rows.retired,
                [
                  "time",
                  "assetCode",
                  "employeeId",
                  "employeeName",
                  "retireReason",
                ],
                (a) => {
                  return [
                    a.returnedAt ? new Date(a.returnedAt).toISOString() : "",
                    a?.asset?.assetId || a.assetId,
                    a?.employee?.employee_id || a.employeeId,
                    a?.employee?.name || "",
                    a?.retireReason || "",
                  ];
                }
              );
              XLSX.utils.book_append_sheet(wb, wsCreated, "created");
              XLSX.utils.book_append_sheet(wb, wsAssigned, "assigned");
              XLSX.utils.book_append_sheet(wb, wsReturned, "returned");
              XLSX.utils.book_append_sheet(wb, wsRetired, "retired");
              XLSX.writeFile(wb, `it_logs_${dt}.xlsx`);
            }}
            sx={{
              "&:hover": {
                backgroundColor: "transparent",
                borderColor: "inherit",
              },
              "&:focus": { outline: "none" },
              "&:active": { boxShadow: "none", outline: "none" },
            }}
          >
            Export Excel
          </Button>
        </Stack>
      </Stack>

      <Paper variant="outlined" sx={{ mb: 2, pl: 0, pr: 1, py: 1 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          {/* Tabs Left */}
          <Tabs
            value={tab}
            onChange={(e, v) => {
              setTab(v);
              setPage(0);
            }}
            variant="scrollable"
            scrollButtons
            allowScrollButtonsMobile
            sx={{
              ml: -3,
              minHeight: "32px",
              "& .MuiTabs-flexContainer": {
                justifyContent: "flex-start",
              },
              "& .MuiTabs-scroller": {
                marginLeft: "0px !important",
              },
              "& .MuiTabs-root": {
                paddingLeft: "0px !important",
              },
              "& .MuiTab-root": {
                pl: 0,
                outline: "none",
                boxShadow: "none",
                fontSize: "0.85rem",
                minHeight: "28px",
                padding: "12px 12px",
                "&:focus": { outline: "none" },
                "&.Mui-focusVisible": { outline: "none" },
              },
            }}
          >
            <Tab value="CREATE_ASSET" label="Assets Created" />
            <Tab value="ASSIGN_ASSET" label="Assigned Assets" />
            <Tab value="RETURN_ASSET" label="Returned Assets" />
            <Tab value="RETIRE_ASSET" label="Retired Assets" />
          </Tabs>

          {/* Search Right */}
          {tab === "CREATE_ASSET" && (
            <TextField
              size="small"
              placeholder="Search..."
              value={searchCreated}
              onChange={(e) => setSearchCreated(e.target.value)}
              sx={{
                width: 200,
                "& .MuiInputBase-root": {
                  height: "32px",
                  fontSize: "0.85rem",
                },
              }}
            />
          )}
          {tab === "ASSIGN_ASSET" && (
            <TextField
              size="small"
              placeholder="Search..."
              value={searchAssigned}
              onChange={(e) => setSearchAssigned(e.target.value)}
              sx={{ ml: 2, width: 250 }}
            />
          )}
          {tab === "RETURN_ASSET" && (
            <TextField
              size="small"
              placeholder="Search..."
              value={searchReturned}
              onChange={(e) => setSearchReturned(e.target.value)}
              sx={{ ml: 2, width: 250 }}
            />
          )}
          {tab === "RETIRE_ASSET" && (
            <TextField
              size="small"
              placeholder="Search..."
              value={searchRetired}
              onChange={(e) => setSearchRetired(e.target.value)}
              sx={{ ml: 2, width: 250 }}
            />
          )}
        </Stack>
      </Paper>

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              {(tab === "CREATE_ASSET" || tab === "RETIRE_ASSET") && (
                <TableCell>Time</TableCell>
              )}
              <TableCell>
                {tab === "CREATE_ASSET" ? "Asset" : "Asset / Action"}
              </TableCell>
              {tab === "CREATE_ASSET" && <TableCell>Created Type</TableCell>}
              {tab !== "CREATE_ASSET" && <TableCell>Employee</TableCell>}
              {tab === "ASSIGN_ASSET" && <TableCell>Assigned At</TableCell>}
              {tab === "RETURN_ASSET" && <TableCell>Returned At</TableCell>}
              {tab === "RETIRE_ASSET" && <TableCell>Retire Reason</TableCell>}
              <TableCell>
                {tab === "RETURN_ASSET" || tab === "RETIRE_ASSET" ? "To" : "By"}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(tab === "RETIRE_ASSET" ? retiredRows : logs)
              .filter((log) => {
                const m =
                  tab === "RETIRE_ASSET" ? log || {} : safeMeta(log.metadata);
                const merged =
                  tab === "RETIRE_ASSET"
                    ? retiredByAssetCode.get(
                        log?.asset?.assetId || log.assetId
                      ) || {}
                    : {};
                const hay = [
                  new Date(
                    tab === "RETIRE_ASSET"
                      ? log.updatedAt ||
                        merged.returnedAt ||
                        log.returnedAt ||
                        log.createdAt
                      : log.createdAt
                  ).toLocaleString(),
                  tab === "RETIRE_ASSET"
                    ? log?.asset?.assetId || log.assetId
                    : m.assetCode || m.assetId || log.entityId,
                  tab === "RETIRE_ASSET"
                    ? merged?.employee?.employee_id ||
                      merged.employeeId ||
                      log?.employee?.employee_id ||
                      log.employeeId
                    : m.employeeId,
                  tab === "RETIRE_ASSET"
                    ? merged?.employee?.name || log?.employee?.name || ""
                    : m.employeeName,
                  tab === "RETIRE_ASSET" ? "" : m.assignedBy,
                  tab === "RETIRE_ASSET" ? "" : m.returnedBy,
                  tab === "RETIRE_ASSET" ? "" : m.retiredBy,
                  tab === "RETIRE_ASSET"
                    ? log?.asset?.assetType || ""
                    : m.assetType,
                  tab === "RETIRE_ASSET" ? log?.asset?.brand || "" : m.brand,
                  tab === "RETIRE_ASSET" ? log?.asset?.model || "" : m.model,
                  tab === "RETIRE_ASSET"
                    ? merged?.retireReason || log?.retireReason || ""
                    : m.retireReason,
                ]
                  .filter(Boolean)
                  .join(" ")
                  .toLowerCase();
                if (tab === "CREATE_ASSET")
                  return hay.includes(searchCreated.toLowerCase());
                if (tab === "ASSIGN_ASSET")
                  return hay.includes(searchAssigned.toLowerCase());
                if (tab === "RETURN_ASSET")
                  return hay.includes(searchReturned.toLowerCase());
                if (tab === "RETIRE_ASSET") {
                  return hay.includes(searchRetired.toLowerCase());
                }
                return true;
              })
              .map((log) => {
                const m =
                  tab === "RETIRE_ASSET" ? log || {} : safeMeta(log.metadata);
                const merged =
                  tab === "RETIRE_ASSET"
                    ? retiredByAssetCode.get(
                        log?.asset?.assetId || log.assetId
                      ) || {}
                    : {};
                const time = new Date(
                  tab === "RETIRE_ASSET"
                    ? log.updatedAt ||
                      merged.returnedAt ||
                      log.returnedAt ||
                      log.createdAt
                    : log.createdAt
                ).toLocaleString();
                const asset =
                  tab === "RETIRE_ASSET"
                    ? log?.asset?.assetId || log.assetId
                    : m.assetCode || m.assetId || log.entityId;
                const emp =
                  tab === "RETIRE_ASSET"
                    ? [
                        merged?.employee?.employee_id ||
                          merged.employeeId ||
                          log?.employee?.employee_id ||
                          log.employeeId,
                        merged?.employee?.name || log?.employee?.name,
                      ]
                        .filter(Boolean)
                        .join(" • ")
                    : [m.employeeId, m.employeeName]
                        .filter(Boolean)
                        .join(" • ");
                const assignedAt =
                  tab === "RETIRE_ASSET"
                    ? ""
                    : m.assignedAt
                    ? new Date(m.assignedAt).toLocaleString()
                    : "";
                const returnedAt =
                  tab === "RETIRE_ASSET"
                    ? ""
                    : m.returnedAt
                    ? new Date(m.returnedAt).toLocaleString()
                    : "";
                return (
                  <TableRow key={`${log.id}-${log.createdAt}`}>
                    {(tab === "CREATE_ASSET" || tab === "RETIRE_ASSET") && (
                      <TableCell>{time}</TableCell>
                    )}
                    <TableCell>
                      {tab === "CREATE_ASSET"
                        ? m.assetId || log.entityId
                        : tab === "RETIRE_ASSET"
                        ? `Retired ${asset}`
                        : renderEntity(log)}
                    </TableCell>
                    {tab === "CREATE_ASSET" && (
                      <TableCell>
                        {(m.assetType || m.type || "").toString().toUpperCase()}
                      </TableCell>
                    )}
                    {tab !== "CREATE_ASSET" && <TableCell>{emp}</TableCell>}
                    {tab === "ASSIGN_ASSET" && (
                      <TableCell>{assignedAt}</TableCell>
                    )}
                    {tab === "RETURN_ASSET" && (
                      <TableCell>{returnedAt}</TableCell>
                    )}
                    {tab === "RETIRE_ASSET" && (
                      <TableCell>
                        {tab === "RETIRE_ASSET"
                          ? merged?.retireReason || log?.retireReason || ""
                          : m.retireReason || ""}
                      </TableCell>
                    )}
                    <TableCell>
                      {tab === "RETIRE_ASSET"
                        ? `IT-ADMIN(${merged?.retiredBy || log.userId || ""})`
                        : `IT-ADMIN(${log.userId})`}
                    </TableCell>
                  </TableRow>
                );
              })}
            {!(tab === "RETIRE_ASSET"
              ? retiredAssetsQuery.isLoading
              : logsQuery.isLoading) &&
              (tab === "RETIRE_ASSET"
                ? retiredRows.length === 0
                : logs.length === 0) && (
                <TableRow>
                  <TableCell
                    colSpan={tab === "CREATE_ASSET" ? 4 : 5}
                    align="center"
                  >
                    No logs
                  </TableCell>
                </TableRow>
              )}
          </TableBody>
        </Table>
        <Divider />
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50, 100]}
        />
      </Paper>
    </Box>
  );
}
