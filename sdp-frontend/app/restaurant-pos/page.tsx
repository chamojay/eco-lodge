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
  Dialog,
} from "@mui/material";
import axios from "axios";
import PaymentModal from "@/components/PaymentModal";
import Receipt from '@/components/Receipt';
import ProtectedRoute from '@/components/ProtectedRoute';

interface MenuItem {
  ItemID: number;
  Name: string;
  Price: string | number;
  CategoryID: number;
  ImagePath: string;
  Description?: string;
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

interface PaymentDetails {
  method: 'Cash' | 'Card' | 'Mobile';
  cardNumber?: string;
  cardHolder?: string;
  mobileNumber?: string;
  referenceNumber?: string;
  source?: 'Web' | 'Reception' | 'Restaurant';
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
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({ method: 'Cash' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

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

  const handleCheckout = () => {
    if (cart.length === 0) {
      setError("Cart is empty!");
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const handlePaymentConfirm = async (details: PaymentDetails) => {
    setIsProcessing(true);
    try {
      // Create order first
      const orderRes = await axios.post<OrderResponse>("http://localhost:5000/api/orders", {
        items: cart.map((item) => ({
          ItemID: item.ItemID,
          Quantity: item.quantity,
          Price: Number(item.Price),
        })),
      });

      // Process payment with Source
      await axios.post("http://localhost:5000/api/payments", {
        OrderID: orderRes.data.OrderID,
        Amount: Number(total.toFixed(2)),
        PaymentMethod: details.method,
        Source: 'Restaurant', // Add this line
        PaymentDetails: {
          ...details,
          timestamp: new Date().toISOString()
        }
      });

      // Prepare receipt data
      setReceiptData({
        orderId: orderRes.data.OrderID,
        items: cart,
        total: total,
        paymentMethod: details.method,
        cashReceived: details.cashReceived,
        balance: details.balance,
        timestamp: new Date().toISOString()
      });

      setShowReceipt(true);
      setCart([]);
      setIsPaymentModalOpen(false);
      setSuccess(`Order #${orderRes.data.OrderID} completed successfully`);
    } catch (err) {
      console.error('Checkout error:', err);
      setError("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['RESTAURANT']}>
      <Box sx={{ p: 4, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
        <Typography variant="h4" gutterBottom sx={{ color: "primary.main" }}>
          Eco Lounge POS System
        </Typography>

        <Grid container spacing={3}>
          {/* Menu Section */}
          <Grid item xs={8}>
            <FormControl 
              fullWidth 
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  borderRadius: 2,
                  '&:hover': {
                    '& > fieldset': {
                      borderColor: 'primary.main',
                    }
                  }
                }
              }}
            >
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
                  <Grid item xs={12} sm={6} md={4} key={item.ItemID}>
                    <Card
                      sx={{
                        cursor: "pointer",
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": { 
                          transform: "translateY(-4px)",
                          boxShadow: 6,
                        },
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      onClick={() => handleAddToCart(item)}
                    >
                      <Box
                        sx={{
                          position: 'relative',
                          paddingTop: '56.25%' // 16:9 aspect ratio
                        }}
                      >
                        {item.ImagePath ? (
                          <Box
                            component="img"
                            src={item.ImagePath || '/images/default-food.jpg'}
                            alt={item.Name}
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/images/default-food.jpg';
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'grey.200'
                            }}
                          >
                            <Typography color="textSecondary">No image</Typography>
                          </Box>
                        )}
                      </Box>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            mb: 1
                          }}
                        >
                          {item.Name}
                        </Typography>
                        {item.Description && (
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            {item.Description}
                          </Typography>
                        )}
                        <Typography 
                          color="primary"
                          variant="h6"
                          sx={{ 
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          Rs. {formatPrice(item.Price)}
                          <Button 
                            size="small" 
                            variant="contained" 
                            sx={{ 
                              minWidth: 'auto',
                              px: 1,
                              bgcolor: 'primary.main',
                              '&:hover': {
                                bgcolor: 'primary.dark'
                              }
                            }}
                          >
                            Add
                          </Button>
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </Grid>

          {/* Cart Section */}
          <Grid item xs={4}>
            <Card 
              sx={{ 
                p: 2, 
                position: "sticky", 
                top: 20,
                borderRadius: 2,
                boxShadow: 3,
                bgcolor: 'white'
              }}
            >
              <Typography 
                variant="h5" 
                gutterBottom
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  pb: 1,
                  mb: 2
                }}
              >
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
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Processing..." : "Checkout"}
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

        <PaymentModal
          open={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onConfirm={handlePaymentConfirm}
          total={total}
          isProcessing={isProcessing}
        />
        <Box sx={{ position: "fixed", top: 24, right: 32, zIndex: 1200 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login/staff?message=You have been logged out.";
            }}
          >
            Logout
          </Button>
        </Box>
        {/* Redirect to login with confirmation if page is refreshed */}
        <React.Fragment>
          {typeof window !== "undefined" && (
            <React.Fragment>
              {(() => {
            // Check if page was refreshed (performance.navigation.type === 1)
            if (
              window.performance &&
              window.performance.getEntriesByType("navigation")[0]?.type === "reload"
            ) {
              localStorage.removeItem("token");
              window.location.href = "/login/staff?message=Session expired. Please login again.";
            }
            return null;
              })()}
            </React.Fragment>
          )}
        </React.Fragment>
        {showReceipt && receiptData && (
          <Dialog
            open={showReceipt}
            onClose={() => setShowReceipt(false)}
            maxWidth="md"
            fullWidth
          >
            <Receipt orderData={receiptData} />
          </Dialog>
        )}
      </Box>
    </ProtectedRoute>
  );
};

export default POSPage;
