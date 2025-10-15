import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listProducts } from "../../api/endpoints";
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Stack,
  TextField,
  InputAdornment,
  Chip,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CreateProductDialog from "./CreateProductDialog";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

function useProducts(params) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => listProducts(params),
  });
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const toImg = (u) => (u?.startsWith("/") ? `${API_BASE}${u}` : u);

export default function BuySellList() {
  const { employeeId } = useAuth();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("created_at");
  const [myOnly, setMyOnly] = useState(false);
  const {
    data = [],
    refetch,
    isLoading,
  } = useProducts({
    search,
    sort,
    order: "desc",
    sellerId: myOnly ? employeeId : undefined,
  });

  const items = data || [];

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
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
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        mb={2}
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        <TextField
          placeholder="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, minWidth: 240 }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={myOnly}
              onChange={(e) => setMyOnly(e.target.checked)}
            />
          }
          label="My Posts"
          sx={{ userSelect: "none" }}
        />
        <Button
          variant="contained"
          onClick={() => setOpen(true)}
          sx={{
            backgroundColor: 'primary.main',
            color: 'common.white',
            boxShadow: 'none',
          }}
        >
          List a Product
        </Button>
      </Stack>

      {isLoading ? (
        <Typography>Loading...</Typography>
      ) : items.length === 0 ? (
        <Box
          sx={{
            py: 8,
            textAlign: "center",
            color: "text.secondary",
            bgcolor: "background.paper",
            borderRadius: 2,
            border: "1px dashed",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            {myOnly ? "You haven't posted anything yet" : "No products found"}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {myOnly
              ? "Create your first post to see it here."
              : "Try adjusting your search or create a new post."}
          </Typography>
          <Stack direction="row" justifyContent="center">
            <Button variant="contained" onClick={() => setOpen(true)}>
              List a Product
            </Button>
          </Stack>
        </Box>
      ) : (
        <Grid container spacing={2} alignItems="stretch">
          {items.map((p) => (
            <Grid item xs={12} sm={6} md={4} key={p.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  minWidth: 320,
                }}
              >
                {p.images?.[0]?.url && (
                  <CardMedia
                    component={Link}
                    to={`/buy-sell/${p.id}`}
                    image={toImg(p.images[0].url)}
                    title={p.name}
                    sx={{ height: 220 }}
                  />
                )}
                {p.status === "sold" && (
                  <Chip
                    label="SOLD"
                    color="warning"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      fontWeight: 700,
                    }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="h6"
                    component={Link}
                    to={`/buy-sell/${p.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    {p.name}
                  </Typography>
                  {p.price != null && (
                    <Typography
                      variant="subtitle2"
                      sx={{ mt: 0.5, fontWeight: 700 }}
                    >
                      ₹ {Number(p.price).toLocaleString()}
                    </Typography>
                  )}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    noWrap
                    sx={{ mt: 0.5 }}
                  >
                    {p.description}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    component={Link}
                    to={`/buy-sell/${p.id}`}
                    size="small"
                  >
                    View
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <CreateProductDialog
        open={open}
        onClose={() => setOpen(false)}
        onCreated={() => {
          setOpen(false);
          refetch();
        }}
      />
    </Box>
  );
}
