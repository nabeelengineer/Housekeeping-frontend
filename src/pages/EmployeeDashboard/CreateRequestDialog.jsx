import React, { useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createRequest,
  listCategories,
  listDepartments,
  getMe,
} from "../../api/endpoints";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../auth/AuthContext";

const schema = z.object({
  type: z.enum(["complaint", "requirement"]),
  description: z.string().optional(),
  department_ids: z.array(z.string()).optional(),
  category_ids: z.array(z.string()).optional(),
  floor: z.enum(["Ground Floor", "1st Floor"]).optional(),
  unit: z.enum(["Unit-1", "Unit-2"]).optional(),
});

export default function CreateRequestDialog({ open, onClose, onCreated }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "complaint",
      department_ids: [],
      category_ids: [],
      floor: "Ground Floor",
      unit: "Unit-1",
    },
  });
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: listDepartments,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  });
  const { employeeId } = useAuth();
  const { data: me } = useQuery({
    queryKey: ["me", employeeId],
    queryFn: getMe,
    staleTime: 0,
  });

  const department_ids = watch("department_ids") || [];
  const category_ids = watch("category_ids") || [];

  useEffect(() => {
    if (me?.department_id) {
      setValue("department_ids", [String(me.department_id)]);
    }
  }, [me, setValue]);

  const onSubmit = async (values) => {
    try {
      await createRequest(values);
      onCreated?.();
      onClose();
    } catch (e) {
      alert(e?.response?.data?.error || "Failed to create request");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Request</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            select
            label="Type"
            size="small"
            defaultValue="complaint"
            {...register("type")}
            error={!!errors.type}
            helperText={errors.type?.message}
          >
            <MenuItem value="complaint">Complaint</MenuItem>
            <MenuItem value="requirement">Requirement</MenuItem>
          </TextField>
          <TextField
            select
            label="Categories"
            size="small"
            SelectProps={{
              multiple: true,
              value: category_ids,
              onChange: (e) => setValue("category_ids", e.target.value),
            }}
          >
            {categories.map((c) => (
              <MenuItem key={c.category_id} value={c.category_id}>
                {c.category_name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Department"
            size="small"
            disabled
            SelectProps={{
              multiple: true,
              value: department_ids,
              onChange: (e) => setValue("department_ids", e.target.value),
            }}
          >
            {departments.map((d) => (
              <MenuItem key={d.dept_id} value={d.dept_id}>
                {d.dept_name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Floor"
            size="small"
            defaultValue="Ground Floor"
            {...register("floor")}
          >
            <MenuItem value="Ground Floor">Ground Floor</MenuItem>
            <MenuItem value="1st Floor">1st Floor</MenuItem>
          </TextField>
          <TextField
            select
            label="Unit"
            size="small"
            defaultValue="Unit-1"
            {...register("unit")}
          >
            <MenuItem value="Unit-1">Unit-1</MenuItem>
            <MenuItem value="Unit-2">Unit-2</MenuItem>
          </TextField>
          <TextField
            label="Description"
            multiline
            minRows={3}
            {...register("description")}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={isSubmitting}
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
  );
}
