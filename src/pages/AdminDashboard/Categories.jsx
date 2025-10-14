import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  listCategories,
  updateCategory,
  deleteCategory,
} from "../../api/endpoints";
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { MdDelete } from "react-icons/md";
import { RiEditLine } from "react-icons/ri";
import { useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import { DataGrid } from "@mui/x-data-grid";

export default function Categories() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  });
  const { register, handleSubmit, reset } = useForm();
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = React.useState(false);
  const [editId, setEditId] = React.useState("");
  const [editName, setEditName] = React.useState("");
  const [confirmId, setConfirmId] = React.useState("");
  const updateMut = useMutation({
    mutationFn: ({ id, name }) => updateCategory(id, { category_name: name }),
    onSuccess: () => {
      enqueueSnackbar("Category updated", { variant: "success" });
      qc.invalidateQueries({ queryKey: ["categories"] });
      setEditId("");
    },
    onError: (e) =>
      enqueueSnackbar(e?.response?.data?.error || "Failed", {
        variant: "error",
      }),
  });
  const deleteMut = useMutation({
    mutationFn: (id) => deleteCategory(id),
    onSuccess: () => {
      enqueueSnackbar("Category deleted", { variant: "success" });
      qc.invalidateQueries({ queryKey: ["categories"] });
      setConfirmId("");
    },
    onError: (e) =>
      enqueueSnackbar(e?.response?.data?.error || "Failed", {
        variant: "error",
      }),
  });
  const mutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      enqueueSnackbar("Category created", { variant: "success" });
      qc.invalidateQueries({ queryKey: ["categories"] });
      reset();
      setOpen(false);
    },
    onError: (e) =>
      enqueueSnackbar(e?.response?.data?.error || "Failed", {
        variant: "error",
      }),
  });

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
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography
          variant="h5"
          color="text.secondary"
          sx={{ flexGrow: 1, ml: 2 }}
        >
          Manage categories
        </Typography>
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
            mr: 3,
          }}
        >
          Create
        </Button>
      </Box>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create Category</DialogTitle>
        <DialogContent>
          <Stack
            spacing={2}
            sx={{ mt: 1 }}
            component="form"
            id="cat-form"
            onSubmit={handleSubmit(mutation.mutate)}
          >
            <TextField
              size="small"
              label="Category ID"
              {...register("category_id")}
              slotProps={{
                paper: {
                  sx: {
                    "& .MuiInputBase-input": { textAlign: "center" },
                    "& .MuiInputLabel-root": {
                      textAlign: "center",
                      width: "100%",
                    },
                  },
                },
              }}
            />
            <TextField
              size="small"
              label="Category Name"
              {...register("category_name")}
              slotProps={{
                paper: {
                  sx: {
                    "& .MuiInputBase-input": { textAlign: "center" },
                    "& .MuiInputLabel-root": {
                      textAlign: "center",
                      width: "100%",
                    },
                  },
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            type="submit"
            form="cat-form"
            variant="contained"
            disabled={mutation.isLoading}
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

      {isLoading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Paper
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            minHeight: 0,
          }}
        >
          <Box sx={{ flexGrow: 1, minHeight: 0, width: "100%" }}>
            <DataGrid
              rows={data.map((c) => ({ id: c.category_id, ...c }))}
              columns={[
                { field: "category_id", headerName: "Category ID", width: 160 },
                {
                  field: "category_name",
                  headerName: "Name",
                  flex: 1,
                  minWidth: 200,
                },
                {
                  field: "actions",
                  headerName: "Actions",
                  width: 140,
                  sortable: false,
                  filterable: false,
                  renderCell: (params) => (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        size="small"
                        aria-label="edit"
                        onClick={() => {
                          setEditId(params.row.category_id);
                          setEditName(params.row.category_name);
                        }}
                      >
                        <RiEditLine />
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label="delete"
                        color="error"
                        onClick={() => setConfirmId(params.row.category_id)}
                      >
                        <MdDelete />
                      </IconButton>
                    </Box>
                  ),
                },
              ]}
              pageSizeOptions={[5, 10, 25]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              sx={{ height: "100%" }}
              disableRowSelectionOnClick
              density="compact"
            />
          </Box>
        </Paper>
      )}

      {/* Edit dialog */}
      <Dialog
        open={!!editId}
        onClose={() => setEditId("")}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Category Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditId("")}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => updateMut.mutate({ id: editId, name: editName })}
            disabled={updateMut.isLoading}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        open={!!confirmId}
        onClose={() => setConfirmId("")}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete category {confirmId}? This cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmId("")}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => deleteMut.mutate(confirmId)}
            disabled={deleteMut.isLoading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
