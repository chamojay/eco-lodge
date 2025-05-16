const pool = require('../../config/db');

const menuController = {
    getMenuItems: async (req, res) => {
        try {
            const [items] = await pool.query('SELECT * FROM menu_items');
            res.json(items);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    addMenuItem: async (req, res) => {
        try {
            const { Name, Price, CategoryID } = req.body;
            const ImagePath = req.file ? `/uploads/menu/${req.file.filename}` : null;

            await pool.query(
                'INSERT INTO menu_items (Name, Price, CategoryID, ImagePath) VALUES (?, ?, ?, ?)', 
                [Name, Price, CategoryID, ImagePath]
            );
            res.status(201).json({ message: 'Menu item added' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    updateMenuItem: async (req, res) => {
        try {
            const { ItemID, Name, Price, CategoryID } = req.body;
            const ImagePath = req.file ? `/uploads/menu/${req.file.filename}` : null;

            await pool.query(
                'UPDATE menu_items SET Name = ?, Price = ?, CategoryID = ?, ImagePath = ? WHERE ItemID = ?', 
                [Name, Price, CategoryID, ImagePath, ItemID]
            );
            res.json({ message: 'Menu item updated' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getCategories: async (req, res) => {
        try {
            const [rows] = await pool.query('SELECT * FROM menu_categories');
            res.json(rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    addCategory: async (req, res) => {
        try {
            const { Name } = req.body;
            await pool.query('INSERT INTO menu_categories (Name) VALUES (?)', [Name]);
            res.status(201).json({ message: 'Category added' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = menuController;