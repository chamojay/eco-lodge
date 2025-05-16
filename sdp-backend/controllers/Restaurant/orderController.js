const pool = require('../../config/db');

const orderController = {
    createOrder: async (req, res) => {
        const { items } = req.body;

        let total = 0;
        for (const item of items) {
            total += item.Price * item.Quantity;
        }

        const [orderResult] = await pool.query('INSERT INTO restaurant_orders (TotalAmount) VALUES (?)', [total]);
        const orderId = orderResult.insertId;

        for (const item of items) {
            await pool.query(
                'INSERT INTO restaurant_order_items (OrderID, ItemID, Quantity) VALUES (?, ?, ?)',
                [orderId, item.ItemID, item.Quantity]
            );
        }

        res.status(201).json({ message: 'Order created', OrderID: orderId });
    },

    getOrders: async (req, res) => {
        const [orders] = await pool.query('SELECT * FROM restaurant_orders ORDER BY OrderDate DESC');
        res.json(orders);
    }
};

module.exports = orderController;
