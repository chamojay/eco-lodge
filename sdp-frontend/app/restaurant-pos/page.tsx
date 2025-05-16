// app/pos/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Alert,
  Snackbar,
} from "@mui/material";
import axios from "axios";

interface MenuItem {
  ItemID: number;
  Name: string;
  Price: string | number; // Change to handle both string and number
  CategoryID: number;
  ImagePath: string | null;
}

interface Category {
  CategoryID: number;
  Name: string;
}

interface OrderResponse {
  OrderID: number;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const POSPage = () => {
  const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
  };

  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Fetch categories and menu items
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, itemsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/menu/categories"),
          axios.get("http://localhost:5000/api/menu/items"),
        ]);
        setCategories(categoriesRes.data);
        setMenuItems(itemsRes.data);
        if (categoriesRes.data.length > 0) {
          setSelectedCategory(categoriesRes.data[0].CategoryID);
        }
      } catch (err) {
        setError("Failed to fetch menu data");
      }
    };
    fetchData();
  }, []);

  // Update total when cart changes
  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => {
      const itemPrice =
        typeof item.Price === "string" ? parseFloat(item.Price) : item.Price;
      return sum + itemPrice * item.quantity;
    }, 0);
    setTotal(newTotal);
  }, [cart]);

  const handleAddToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.ItemID === item.ItemID);
      if (existingItem) {
        return prevCart.map((i) =>
          i.ItemID === item.ItemID
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (itemId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.ItemID !== itemId));
  };

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveFromCart(itemId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.ItemID === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleCheckout = async () => {
    try {
      if (cart.length === 0) {
        setError("Cart is empty!");
        return;
      }

      // Create order with properly formatted prices
      const orderRes = await axios.post<OrderResponse>("http://localhost:5000/api/orders", {
        items: cart.map((item) => ({
          ItemID: item.ItemID,
          Quantity: item.quantity,
          Price: Number(item.Price),
        })),
      });

      // Process payment with properly formatted total
      await axios.post("http://localhost:5000/api/payments", {
        OrderID: orderRes.data.OrderID,
        Amount: Number(total.toFixed(2)),
        PaymentMethod: "Cash",
      });

      setCart([]);
      setSuccess(`Order #${orderRes.data.OrderID} completed successfully`);
    } catch (err) {
      console.error('Checkout error:', err);
      setError("Checkout failed. Please try again.");
    }
  };

  return (
    <Box sx={{ p: 4, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      <Typography variant="h4" gutterBottom sx={{ color: "primary.main" }}>
        Eco Lounge POS System
      </Typography>

      <Grid container spacing={3}>
        {/* Menu Section */}
        <Grid item xs={8}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={(e) => setSelectedCategory(Number(e.target.value))}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.CategoryID} value={cat.CategoryID}>
                  {cat.Name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Grid container spacing={2}>
            {menuItems
              .filter((item) => item.CategoryID === selectedCategory)
              .map((item) => (
                <Grid item xs={4} key={item.ItemID}>
                  <Card
                    sx={{
                      cursor: "pointer",
                      "&:hover": { transform: "scale(1.02)" },
                      transition: "transform 0.2s",
                    }}
                    onClick={() => handleAddToCart(item)}
                  >
                    <CardContent>
                      <Typography variant="h6">{item.Name}</Typography>
                      <Typography color="primary">
                        Rs. {formatPrice(item.Price)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Grid>

        {/* Cart Section */}
        <Grid item xs={4}>
          <Card sx={{ p: 2, position: "sticky", top: 20 }}>
            <Typography variant="h5" gutterBottom>
              Cart
            </Typography>

            {cart.length === 0 ? (
              <Typography color="text.secondary">No items in cart</Typography>
            ) : (
              <>
                {cart.map((item) => (
                  <Box
                    key={item.ItemID}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography>{item.Name}</Typography>
                    <Box>
                      <Button
                        size="small"
                        onClick={() =>
                          handleUpdateQuantity(item.ItemID, item.quantity - 1)
                        }
                      >
                        -
                      </Button>
                      <Typography component="span" sx={{ mx: 1 }}>
                        {item.quantity}
                      </Typography>
                      <Button
                        size="small"
                        onClick={() =>
                          handleUpdateQuantity(item.ItemID, item.quantity + 1)
                        }
                      >
                        +
                      </Button>
                      <Typography sx={{ ml: 2 }}>
                        Rs. {formatPrice(Number(item.Price) * item.quantity)}
                      </Typography>
                    </Box>
                  </Box>
                ))}

                <Box sx={{ mt: 3, borderTop: 1, pt: 2 }}>
                  <Typography variant="h6">
                    Total: Rs. {total.toFixed(2)}
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleCheckout}
                    sx={{ mt: 2 }}
                  >
                    Checkout
                  </Button>
                </Box>
              </>
            )}
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
      >
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess("")}
      >
        <Alert severity="success" onClose={() => setSuccess("")}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default POSPage;
