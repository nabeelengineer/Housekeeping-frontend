import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import { createProduct } from "../../api/endpoints";

export default function CreateProductDialog({ open, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = (e) => {
    const f = Array.from(e.target.files || []);
    setFiles(f.slice(0, 5));
  };

  const submit = async () => {
    setError("");
    if (!name.trim()) {
      setError("Product name is required");
      return;
    }
    if (price && isNaN(Number(price))) {
      setError("Price must be a number");
      return;
    }
    if (files.length < 3 || files.length > 5) {
      setError("Please select 3 to 5 images");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      if (description.trim()) fd.append("description", description.trim());
       if (price !== "") fd.append("price", price);
      files.forEach((f) => fd.append("images", f));
      await createProduct(fd);
      onCreated?.();
      onClose?.();
      setName("");
      setDescription("");
      setPrice("");
      setFiles([]);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>List a Product for Sale</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="Product Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline minRows={3} />
          <TextField label="Price (optional)" value={price} onChange={(e) => setPrice(e.target.value)} fullWidth placeholder="e.g. 1999.00" />
          <Stack>
            <Typography variant="body2" color="text.secondary">
              Upload 3–5 images (jpg, png, webp). Max 5MB each.
            </Typography>
            <input type="file" multiple accept="image/*" onChange={handleFiles} />
            <Typography variant="caption">Selected: {files.length}</Typography>
          </Stack>
          {error && (
            <Typography color="error" variant="body2">{error}</Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={submitting}>Create</Button>
      </DialogActions>
    </Dialog>
  );
}
