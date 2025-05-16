const pool = require('../../config/db');

const paymentController = {
    addPayment: async (req, res) => {
        const { Amount, PaymentMethod, ReservationID, OrderID } = req.body;

        await pool.query(
            'INSERT INTO payments (Amount, PaymentMethod, ReservationID, OrderID) VALUES (?, ?, ?, ?)',
            [Amount, PaymentMethod, ReservationID || null, OrderID || null]
        );

        res.status(201).json({ message: 'Payment recorded' });
    },

    getPayments: async (req, res) => {
        const [payments] = await pool.query('SELECT * FROM payments ORDER BY PaymentDate DESC');
        res.json(payments);
    },
};

module.exports = paymentController;
