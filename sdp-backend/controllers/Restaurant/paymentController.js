const pool = require('../../config/db');

const paymentController = {
    addPayment: async (req, res) => {
        const { Amount, PaymentMethod, ReservationID, OrderID, Source = 'Restaurant' } = req.body;

        try {
            await pool.query(
                'INSERT INTO payments (Amount, PaymentMethod, ReservationID, OrderID, Source) VALUES (?, ?, ?, ?, ?)',
                [Amount, PaymentMethod, ReservationID || null, OrderID || null, Source]
            );

            res.status(201).json({ message: 'Payment recorded' });
        } catch (error) {
            console.error('Error adding payment:', error);
            res.status(500).json({ error: 'Failed to record payment' });
        }
    },

    getPayments: async (req, res) => {
        const [payments] = await pool.query('SELECT * FROM payments ORDER BY PaymentDate DESC');
        res.json(payments);
    },
};

module.exports = paymentController;
