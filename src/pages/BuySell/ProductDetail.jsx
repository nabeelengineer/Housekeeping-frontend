import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { deleteProduct } from "../../api/endpoints";
import {
  Box,
  Grid,
  Typography,
  Button,
  Stack,
  Card,
  CardMedia,
  TextField,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useAuth } from "../../auth/AuthContext";
import {
  getProduct,
  expressInterest,
  listComments,
  addComment,
  flagProduct,
  markProductSold,
  getMyInterest,
  listProductInterests,
} from "../../api/endpoints";

function useProduct(id) {
  return useQuery({ queryKey: ["product", id], queryFn: () => getProduct(id) });
}

function useComments(id) {
  return useQuery({
    queryKey: ["productComments", id],
    queryFn: () => listComments(id),
  });
}

const toImg = (u) => {
  if (!u) return '';
  
  // If it's already a full URL, return as is
  if (u.startsWith('http') || u.startsWith('blob:')) {
    return u;
  }
  
  // In production, use relative paths (handled by Nginx)
  if (import.meta.env.PROD) {
    if (u.startsWith('/uploads/')) {
      return u;
    }
    return `/uploads/market/${u}`;
  }
  
  // In development, use the full URL
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
  if (u.startsWith('/uploads/')) {
    return `${baseUrl}${u}`;
  }
  return `${baseUrl}/uploads/market/${u}`;
};

export default function ProductDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { employeeId } = useAuth();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id);
  const { data: comments = [], refetch: refetchComments } = useComments(id);
  const { data: myInterest } = useQuery({
    queryKey: ["myInterest", id],
    queryFn: () => getMyInterest(id),
    enabled: !!id,
  });

  const isAlreadyInterested = !!myInterest;
  const { data: interests = [] } = useQuery({
    queryKey: ["productInterests", id],
    queryFn: () => listProductInterests(id),
    enabled: !!id && !!product && product.seller_id === employeeId,
  });

  const [commentText, setCommentText] = useState("");
  const [flagText, setFlagText] = useState("");
  const [showSeller, setShowSeller] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const interested = useMutation({
    mutationFn: () => expressInterest(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myInterest", id] }),
  });

  const addC = useMutation({
    mutationFn: () => addComment(id, { text: commentText }),
    onSuccess: () => {
      setCommentText("");
      refetchComments();
    },
  });

  const flag = useMutation({
    mutationFn: () => flagProduct(id, { reason: flagText }),
    onSuccess: () => setFlagText(""),
  });

  const markSold = useMutation({
    mutationFn: () => markProductSold(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["product", id] }),
  });

  const updateMut = useMutation({
    mutationFn: () =>
      updateProduct(id, {
        name: editName,
        price: editPrice,
        description: editDesc,
      }),
    onSuccess: async () => {
      setEditOpen(false);
      await qc.invalidateQueries({ queryKey: ["product", id] });
    },
  });

  const { enqueueSnackbar } = useSnackbar();

  const deleteMut = useMutation({
    mutationFn: () => deleteProduct(id),
    onSuccess: async () => {
      // Invalidate and refetch products list and current product
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['products'] }),
        qc.invalidateQueries({ queryKey: ['product', id] })
      ]);
      
      // Show success message
      enqueueSnackbar('Product deleted successfully', { variant: 'success' });
      
      // Navigate back to the product list after a short delay
      setTimeout(() => {
        navigate('/buy-sell');
      }, 500);
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
      enqueueSnackbar(
        error.response?.data?.error || 'Failed to delete product', 
        { variant: 'error' }
      );
    },
  });

  // Add a confirmation dialog for delete
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };
  const handleDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    deleteMut.mutate();
  };

  if (isLoading) return <Typography>Loading...</Typography>;
  if (!product) return <Typography>Not found</Typography>;

  const isSeller = product?.seller_id === employeeId;

  return (
    <Box>
      {/* Top bar: Back (left) and View Details (right) */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Button
          component={Link}
          to="/buy-sell"
          variant="outlined"
          sx={{
            height: 36,
            color: "inherit",
            borderColor: "grey.400",
            backgroundColor: "transparent",
            "&:hover": {
              color: "primary.main",
            },
            "&:focus": {
              outline: "none",
              boxShadow: "none",
            },
          }}
          // disableRipple
        >
          Back to list
        </Button>
        <Box sx={{ ml: "auto" }}>
          <Button
            variant="outlined"
            size="small"
            sx={{
              mb: 2,
              height: 36,
              color: "inherit",
              borderColor: "grey.400",
              backgroundColor: "transparent",
              "&:hover": {
                color: "primary.main",
                borderColor: "grey.400",
                backgroundColor: "transparent",
              },
              "&:focus": {
                outline: "none",
                boxShadow: "none",
              },
              "&:focus-visible": {
                outline: "none",
                boxShadow: "none",
              },
            }}
            disableRipple
            disableFocusRipple
            onClick={() => setShowSeller(true)}
          >
            View Details
          </Button>
        </Box>
      </Stack>

      {/* Seller details dialog */}
      <Dialog
        open={showSeller}
        onClose={() => setShowSeller(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Seller Contact</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Name"
            value={product.seller?.name || ""}
            size="small"
            fullWidth
            margin="dense"
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Employee ID"
            value={product.seller?.employee_id || ""}
            size="small"
            fullWidth
            margin="dense"
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Phone"
            value={product.seller?.phone_no || ""}
            size="small"
            fullWidth
            margin="dense"
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Email"
            value={product.seller?.email || ""}
            size="small"
            fullWidth
            margin="dense"
            InputProps={{ readOnly: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowSeller(false)}
            sx={{
              "&:focus": {
                outline: "none",
                boxShadow: "none",
              },
            }}
            disableRipple
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Images in one line */}
      <Stack direction="row" spacing={2} sx={{ overflowX: "auto", pb: 2 }}>
        {(product.images || []).map((img) => (
          <Card
            key={img.id}
            sx={{ width: "calc((100% - 32px) / 3)", flexShrink: 0 }}
          >
            <CardMedia
              component="img"
              image={toImg(img.url)}
              alt={product.name}
            />
          </Card>
        ))}
      </Stack>

      {/* Product Info */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          {product.name}
        </Typography>
        {product.status === "sold" && (
          <Chip
            label="SOLD"
            color="warning"
            size="small"
            sx={{ mt: 1, fontWeight: 700 }}
          />
        )}
        {product.price != null && (
          <Typography variant="h6" sx={{ mt: 1, fontWeight: 800 }}>
            ₹ {Number(product.price).toLocaleString()}
          </Typography>
        )}
        <Typography sx={{ whiteSpace: "pre-wrap", mt: 1 }}>
          {product.description || ""}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Interest/Mark Sold */}
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        {isSeller ? (
          <>
            <Button
              variant="outlined"
              color="warning"
              onClick={() => markSold.mutate()}
              disabled={product.status !== "active"}
            >
              Mark as Sold
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setEditName(product.name || "");
                setEditPrice(product.price ?? "");
                setEditDesc(product.description || "");
                setEditOpen(true);
              }}
              sx={{
                height: 36,
                color: "inherit",
                borderColor: "grey.400",
                backgroundColor: "transparent",
                "&:hover": {
                  color: "primary.main",
                },
                "&:focus": {
                  outline: "none",
                  boxShadow: "none",
                },
              }}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteClick}
              disabled={deleteMut.isPending}
            >
              {deleteMut.isPending ? "Deleting..." : "Delete"}
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            onClick={() => interested.mutate()}
            disabled={
              interested.isPending ||
              product.status === "sold" ||
              isAlreadyInterested
            }
          >
            {isAlreadyInterested ? "Interested" : "I'm Interested"}
          </Button>
        )}
      </Stack>

      {!isSeller && isAlreadyInterested && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, display: "block" }}
        >
          Your interest has been sent to the seller.
        </Typography>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Comments */}
      <Typography variant="subtitle2" gutterBottom>
        Comments
      </Typography>
      <Stack spacing={1}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <TextField
            fullWidth
            size="small"
            placeholder="Add a comment"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={() => addC.mutate()}
            disabled={!commentText.trim()}
          >
            Post
          </Button>
        </Stack>
        {(comments || []).map((c) => (
          <Box
            key={c.id}
            sx={{ p: 1, bgcolor: "background.paper", borderRadius: 1 }}
          >
            <Typography variant="body2">{c.text}</Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(c.created_at).toLocaleString()}
            </Typography>
          </Box>
        ))}
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Flag product */}
      {!isSeller && (
        <>
          <Typography variant="subtitle2" gutterBottom>
            Flag Product
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Reason"
              value={flagText}
              onChange={(e) => setFlagText(e.target.value)}
            />
            <Button
              variant="outlined"
              color="error"
              onClick={() => flag.mutate()}
              disabled={!flagText.trim()}
            >
              Flag
            </Button>
          </Stack>
        </>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Price"
              type="number"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              fullWidth
            />
            <TextField
              label="Description"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => updateMut.mutate()}
            disabled={updateMut.isPending}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this product? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={deleteMut.isPending}
          >
            {deleteMut.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Interested Buyers (only for seller) */}
      {isSeller && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            Interested Buyers
          </Typography>
          <Stack spacing={1}>
            {(interests || []).map((it) => (
              <Box
                key={it.id}
                sx={{ p: 1, bgcolor: "background.paper", borderRadius: 1 }}
              >
                <Typography variant="body2">
                  {it.buyer?.name} ({it.buyer?.employee_id})
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Phone: {it.buyer?.phone_no} • Email: {it.buyer?.email}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  Interested at: {new Date(it.created_at).toLocaleString()}
                </Typography>
              </Box>
            ))}
            {!interests?.length && (
              <Typography variant="caption" color="text.secondary">
                No interests yet.
              </Typography>
            )}
          </Stack>
        </>
      )}
    </Box>
  );
}
