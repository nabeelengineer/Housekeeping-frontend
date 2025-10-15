import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { myAssets } from '../../api/endpoints';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

export default function MyAssets() {
  const { data, isLoading } = useQuery({ queryKey: ['my-assets'], queryFn: myAssets });
  const rows = data?.data || [];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>My Assets</Typography>
      {isLoading ? 'Loading...' : rows.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            No assets assigned yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            When an asset is assigned to you, it will appear here.
          </Typography>
        </Paper>
      ) : (
        <Paper>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Assignment ID</TableCell>
                <TableCell>Asset ID</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Brand/Model</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned At</TableCell>
                <TableCell>Returned At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.id}</TableCell>
                  <TableCell>{a?.asset?.assetId || a.assetId}</TableCell>
                  <TableCell>{a?.asset?.assetType || '-'}</TableCell>
                  <TableCell>{[a?.asset?.brand, a?.asset?.model].filter(Boolean).join(' ') || '-'}</TableCell>
                  <TableCell>{a.status}</TableCell>
                  <TableCell>{a.assignedAt ? new Date(a.assignedAt).toLocaleString() : ''}</TableCell>
                  <TableCell>{a.returnedAt ? new Date(a.returnedAt).toLocaleString() : ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
}
