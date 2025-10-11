import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getMe, listDepartments } from "../api/endpoints";
import { Box, Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import { useAuth } from "../auth/AuthContext";

export default function Profile() {
  const { employeeId } = useAuth();
  const { data: me, isLoading, error } = useQuery({ queryKey: ["me", employeeId], queryFn: getMe, staleTime: 0 });
  const { data: departments = [] } = useQuery({ queryKey: ["departments"], queryFn: listDepartments });

  const deptName = React.useMemo(() => {
    if (!me?.department_id) return "-";
    const d = departments.find((x) => String(x.dept_id) === String(me.department_id));
    return d ? `${d.dept_name} (${d.dept_id})` : me.department_id;
  }, [me, departments]);

  if (isLoading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">Failed to load profile</Typography>;
  if (!me) return <Typography>No data</Typography>;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 800 }}>My Profile</Typography>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={1.2}>
            <Box>
              <Typography variant="overline" color="text.secondary">Name</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>{me.name || "-"}</Typography>
            </Box>
            <Divider />
            <Box>
              <Typography variant="overline" color="text.secondary">Employee ID</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>{me.employee_id || me.id || "-"}</Typography>
            </Box>
            <Divider />
            <Box>
              <Typography variant="overline" color="text.secondary">Phone</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>{me.phone_no || "-"}</Typography>
            </Box>
            <Divider />
            <Box>
              <Typography variant="overline" color="text.secondary">Email</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>{me.email || "-"}</Typography>
            </Box>
            <Divider />
            <Box>
              <Typography variant="overline" color="text.secondary">Department</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>{deptName}</Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
