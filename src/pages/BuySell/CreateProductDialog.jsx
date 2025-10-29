import React, { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
} from "@mui/material";
import { createProduct } from "../../api/endpoints";
import { Delete as DeleteIcon } from "@mui/icons-material";

// File size and count constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const MIN_IMAGES = 2;
const MAX_IMAGES = 4;

export default function CreateProductDialog({ open, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  const handleFiles = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Check file sizes
    const oversizedFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      setError(`Some files exceed the 5MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    // Limit to MAX_IMAGES files
    const filesToAdd = selectedFiles.slice(0, MAX_IMAGES - files.length);
    if (filesToAdd.length === 0) {
      setError(`You can upload a maximum of ${MAX_IMAGES} images`);
      return;
    }

    // Create previews
    const newPreviews = filesToAdd.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));

    setFilePreviews(prev => [...prev, ...newPreviews].slice(0, MAX_IMAGES));
    setFiles(prev => [...prev, ...filesToAdd].slice(0, MAX_IMAGES));
    setError("");
    setFileInputKey(Date.now());
  }, [files.length]);

  const removeFile = (index) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(filePreviews[index]?.url);
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
    setFiles(prev => prev.filter((_, i) => i !== index));
    setError("");
  };

  // Clean up object URLs when component unmounts or updates
  useEffect(() => {
    return () => {
      filePreviews.forEach(preview => {
        if (preview && preview.url) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [filePreviews]);
  
  // Reset form when dialog is closed
  useEffect(() => {
    if (!open) {
      // Clean up existing previews
      filePreviews.forEach(preview => {
        if (preview && preview.url) {
          URL.revokeObjectURL(preview.url);
        }
      });
      
      // Reset all states
      setName("");
      setDescription("");
      setPrice("");
      setFiles([]);
      setFilePreviews([]);
      setError("");
      setFileInputKey(Date.now());
    }
  }, [open]);

  const submit = async () => {
    setError("");
    
    // Validate form
    if (!name.trim()) {
      setError("Product name is required");
      return;
    }
    
    if (price && isNaN(Number(price))) {
      setError("Price must be a number");
      return;
    }
    
    // Validate image count
    if (files.length < MIN_IMAGES) {
      setError(`Please upload at least ${MIN_IMAGES} images (${MIN_IMAGES - files.length} more needed)`);
      return;
    }
    
    if (files.length > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      if (description.trim()) fd.append("description", description.trim());
      
      // Handle price conversion
      if (price !== "") {
        const priceNum = Number(price);
        if (isNaN(priceNum)) {
          setError("Price must be a valid number");
          return;
        }
        fd.append("price", priceNum);
      }
      
      // Append files
      files.forEach((f) => fd.append("images", f));
      
      // Log form data for debugging
      console.log("Submitting form data:", {
        name: name.trim(),
        description: description.trim(),
        price: price !== "" ? Number(price) : "",
        fileCount: files.length
      });
      
      await createProduct(fd);
      onCreated?.();
      onClose?.();
      setName("");
      setDescription("");
      setPrice("");
      setFiles([]);
      setFileInputKey(Date.now());
    } catch (err) {
      const errorMessage = err?.response?.data?.error || err.message || "Failed to create product";
      console.error("Product creation error:", errorMessage, err);
      setError(errorMessage);
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
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Upload {MIN_IMAGES}–{MAX_IMAGES} images (jpg, png, webp). Max 5MB each.
            </Typography>
            <Button
              variant="outlined"
              component="label"
              disabled={files.length >= MAX_IMAGES}
              sx={{ mb: 2 }}
            >
              Add Images ({files.length}/{MAX_IMAGES})
              <input
                key={fileInputKey}
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={handleFiles}
                disabled={files.length >= MAX_IMAGES}
              />
            </Button>
            
            {filePreviews.length > 0 && (
              <Box border={1} borderColor="divider" borderRadius={1} p={2} mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Images ({filePreviews.length}/{MAX_IMAGES}):
                </Typography>
                <List dense>
                  {filePreviews.map((preview, index) => (
                    <ListItem 
                      key={index}
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          aria-label="delete"
                          onClick={() => removeFile(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <img 
                        src={preview.url} 
                        alt={`Preview ${index}`} 
                        style={{ 
                          width: 50, 
                          height: 50, 
                          objectFit: 'cover',
                          marginRight: 10,
                          borderRadius: 4
                        }} 
                      />
                      <ListItemText 
                        primary={preview.name} 
                        secondary={`${(preview.size / 1024).toFixed(1)} KB`} 
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            
            {files.length > 0 && (
              <Box border={1} borderColor="divider" borderRadius={1} p={1}>
                <Typography variant="subtitle2" gutterBottom>Selected Images ({files.length}/4):</Typography>
                <List dense>
                  {files.map((file, index) => (
                    <ListItem 
                      key={index}
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          aria-label="delete"
                          onClick={() => removeFile(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText 
                        primary={file.name}
                        secondary={`${(file.size / (1024 * 1024)).toFixed(2)} MB`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
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
