'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Tabs,
    Tab,
    Typography,
    Paper,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';

interface MenuItem {
    ItemID: number;
    Name: string;
    Price: string | number; // Update to handle both string and number
    CategoryID: number;
    ImagePath: string | null;
    Image?: File | null; // Add this line to allow for an Image property
}

interface Category {
    CategoryID: number;
    Name: string;
}

interface Order {
    OrderID: number;
    TotalAmount: string | number;
    OrderDate: string;
    items: Array<{
        ItemID: number;
        Name: string;
        Quantity: number;
        Price: number;
    }>;
}

const Adminrestaurant = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form states
    const [newItem, setNewItem] = useState({
        Name: '',
        Price: '',
        CategoryID: '',
        Image: null as File | null,
    });

    const [newCategory, setNewCategory] = useState({
        Name: '',
    });

    // Edit states
    const [editItem, setEditItem] = useState<MenuItem | null>(null);
    const [editCategory, setEditCategory] = useState<Category | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [itemsRes, categoriesRes, ordersRes] = await Promise.all([
                axios.get<MenuItem[]>('http://localhost:5000/api/menu/items'),
                axios.get<Category[]>('http://localhost:5000/api/menu/categories'),
                axios.get<Order[]>('http://localhost:5000/api/orders')
            ]);

            setMenuItems(itemsRes.data);
            setCategories(categoriesRes.data);
            setOrders(ordersRes.data);
        } catch (error) {
            setError('Failed to fetch data');
        }
    };

    const handleAddMenuItem = async () => {
        try {
            const formData = new FormData();
            formData.append('Name', newItem.Name);
            formData.append('Price', newItem.Price);
            formData.append('CategoryID', newItem.CategoryID);
            if (newItem.Image) {
                formData.append('image', newItem.Image);
            }

            await axios.post('http://localhost:5000/api/menu/items', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setSuccess('Menu item added successfully');
            setOpenDialog(false);
            fetchData();
            setNewItem({ Name: '', Price: '', CategoryID: '', Image: null });
        } catch (error) {
            setError('Failed to add menu item');
        }
    };

    const handleAddCategory = async () => {
        try {
            await axios.post('http://localhost:5000/api/menu/categories', newCategory);
            setSuccess('Category added successfully');
            setOpenCategoryDialog(false);
            fetchData();
            setNewCategory({ Name: '' });
        } catch (error) {
            setError('Failed to add category');
        }
    };

    const handleDeleteMenuItem = async (itemId: number) => {
        if (window.confirm('Are you sure you want to delete this menu item?')) {
            try {
                const response = await axios.delete(`http://localhost:5000/api/menu/items/${itemId}`);
                setSuccess(response.data.message);
                fetchData();
            } catch (error: any) {
                setError(
                    error.response?.data?.error || 
                    'Failed to delete menu item'
                );
            }
        }
    };

    const handleUpdateMenuItem = async () => {
        if (!editItem) return;

        try {
            const formData = new FormData();
            formData.append('Name', editItem.Name);
            formData.append('Price', editItem.Price.toString());
            formData.append('CategoryID', editItem.CategoryID.toString());
            if (editItem.Image instanceof File) {
                formData.append('image', editItem.Image);
            }

            await axios.put(
                `http://localhost:5000/api/menu/items/${editItem.ItemID}`, 
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );

            setSuccess('Menu item updated successfully');
            setEditItem(null);
            fetchData();
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to update menu item');
        }
    };

    const handleDeleteCategory = async (categoryId: number) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await axios.delete(`http://localhost:5000/api/menu/categories/${categoryId}`);
                setSuccess('Category deleted successfully');
                fetchData();
            } catch (error) {
                setError('Failed to delete category');
            }
        }
    };

    const handleUpdateCategory = async () => {
        if (!editCategory) return;

        try {
            await axios.put(`http://localhost:5000/api/menu/categories/${editCategory.CategoryID}`, {
                Name: editCategory.Name
            });

            setSuccess('Category updated successfully');
            setEditCategory(null);
            fetchData();
        } catch (error) {
            setError('Failed to update category');
        }
    };

    const renderMenuItems = () => (
        <Box>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Menu Items</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                >
                    Add Item
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Price (Rs.)</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {menuItems.map((item) => (
                            <TableRow key={item.ItemID}>
                                <TableCell>{item.Name}</TableCell>
                                <TableCell>
                                    {categories.find(c => c.CategoryID === item.CategoryID)?.Name}
                                </TableCell>
                                <TableCell>
                                    {Number(item.Price).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    <Button 
                                        color="primary" 
                                        onClick={() => setEditItem(item)}
                                    >
                                        Edit
                                    </Button>
                                    <Button 
                                        color="error"
                                        onClick={() => handleDeleteMenuItem(item.ItemID)}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );

    const renderCategories = () => (
        <Box>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Categories</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenCategoryDialog(true)}
                >
                    Add Category
                </Button>
            </Box>
    
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow key={category.CategoryID}>
                                <TableCell>{category.CategoryID}</TableCell>
                                <TableCell>{category.Name}</TableCell>
                                <TableCell>
                                    <Button 
                                        color="primary" 
                                        onClick={() => setEditCategory(category)}
                                    >
                                        Edit
                                    </Button>
                                    <Button 
                                        color="error"
                                        onClick={() => handleDeleteCategory(category.CategoryID)}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );

    const renderOrders = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Order History</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Order ID</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Items</TableCell>
                            <TableCell>Total Amount</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.OrderID}>
                                <TableCell>{order.OrderID}</TableCell>
                                <TableCell>
                                    {new Date(order.OrderDate).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    {order.items?.map(item => 
                                        `${item.Name} (${item.Quantity}x)`
                                    ).join(', ')}
                                </TableCell>
                                <TableCell>Rs. {Number(order.TotalAmount).toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );

    return (
        <Box sx={{ p: 3 }}>
            {/* Add this fragment for refresh handling */}
            <React.Fragment>
                {typeof window !== "undefined" && (
                    <React.Fragment>
                        {(() => {
                            // Check if page was refreshed
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

            <Typography variant="h4" sx={{ mb: 3 }}>Restaurant Management</Typography>
            
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            )}
            
            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>
            )}

            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
                <Tab label="Menu Items" />
                <Tab label="Categories" />
                <Tab label="Orders" />
            </Tabs>

            <Box sx={{ mt: 3 }}>
                {activeTab === 0 && renderMenuItems()}
                {activeTab === 1 && renderCategories()}
                {activeTab === 2 && renderOrders()}
            </Box>

            {/* Add Menu Item Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Add Menu Item</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Name"
                        margin="normal"
                        value={newItem.Name}
                        onChange={(e) => setNewItem({ ...newItem, Name: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        label="Price"
                        type="number"
                        margin="normal"
                        value={newItem.Price}
                        onChange={(e) => setNewItem({ ...newItem, Price: e.target.value })}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={newItem.CategoryID}
                            onChange={(e) => setNewItem({ ...newItem, CategoryID: e.target.value })}
                        >
                            {categories.map((category) => (
                                <MenuItem key={category.CategoryID} value={category.CategoryID}>
                                    {category.Name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNewItem({ 
                            ...newItem, 
                            Image: e.target.files ? e.target.files[0] : null 
                        })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddMenuItem} variant="contained">Add</Button>
                </DialogActions>
            </Dialog>

            {/* Add Category Dialog */}
            <Dialog open={openCategoryDialog} onClose={() => setOpenCategoryDialog(false)}>
                <DialogTitle>Add Category</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Category Name"
                        margin="normal"
                        value={newCategory.Name}
                        onChange={(e) => setNewCategory({ ...newCategory, Name: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCategoryDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddCategory} variant="contained">Add</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Menu Item Dialog */}
            <Dialog open={!!editItem} onClose={() => setEditItem(null)}>
                <DialogTitle>Edit Menu Item</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Name"
                        margin="normal"
                        value={editItem?.Name || ''}
                        onChange={(e) => setEditItem(prev => prev ? {...prev, Name: e.target.value} : null)}
                    />
                    <TextField
                        fullWidth
                        label="Price"
                        type="number"
                        margin="normal"
                        value={editItem?.Price || ''}
                        onChange={(e) => setEditItem(prev => prev ? {...prev, Price: e.target.value} : null)}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={editItem?.CategoryID || ''}
                            onChange={(e) => setEditItem(prev => prev ? {...prev, CategoryID: Number(e.target.value)} : null)}
                        >
                            {categories.map((category) => (
                                <MenuItem key={category.CategoryID} value={category.CategoryID}>
                                    {category.Name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEditItem(prev => prev ? {
                            ...prev, 
                            Image: e.target.files ? e.target.files[0] : null
                        } : null)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditItem(null)}>Cancel</Button>
                    <Button onClick={handleUpdateMenuItem} variant="contained">Update</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Category Dialog */}
            <Dialog open={!!editCategory} onClose={() => setEditCategory(null)}>
                <DialogTitle>Edit Category</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Category Name"
                        margin="normal"
                        value={editCategory?.Name || ''}
                        onChange={(e) => setEditCategory(prev => prev ? {...prev, Name: e.target.value} : null)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditCategory(null)}>Cancel</Button>
                    <Button onClick={handleUpdateCategory} variant="contained">Update</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Adminrestaurant;
