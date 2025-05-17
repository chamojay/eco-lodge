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
        try {
            const [orders] = await pool.query(`
                SELECT 
                    o.*,
                    GROUP_CONCAT(
                        JSON_OBJECT(
                            'ItemID', oi.ItemID,
                            'Name', mi.Name,
                            'Quantity', oi.Quantity,
                            'Price', mi.Price
                        )
                    ) as items
                FROM restaurant_orders o
                LEFT JOIN restaurant_order_items oi ON o.OrderID = oi.OrderID
                LEFT JOIN menu_items mi ON oi.ItemID = mi.ItemID
                GROUP BY o.OrderID
                ORDER BY o.OrderDate DESC
            `);

            // Parse the concatenated JSON string back into an array
            orders.forEach(order => {
                order.items = order.items ? JSON.parse(`[${order.items}]`) : [];
            });

            res.json(orders);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = orderController;
