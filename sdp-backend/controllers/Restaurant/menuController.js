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
            const { id } = req.params;
            const { Name, Price, CategoryID } = req.body;
            const ImagePath = req.file ? `/uploads/menu/${req.file.filename}` : null;

            let query = 'UPDATE menu_items SET Name = ?, Price = ?, CategoryID = ?';
            let params = [Name, Price, CategoryID];

            if (ImagePath) {
                query += ', ImagePath = ?';
                params.push(ImagePath);
            }

            query += ' WHERE ItemID = ?';
            params.push(id);

            const [result] = await pool.query(query, params);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Menu item not found' });
            }

            res.json({ message: 'Menu item updated successfully' });
        } catch (error) {
            console.error('Error updating menu item:', error);
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
    },

    deleteMenuItem: async (req, res) => {
        try {
            const { id } = req.params;
            
            // First check if item exists
            const [item] = await pool.query('SELECT * FROM menu_items WHERE ItemID = ?', [id]);
            
            if (!item.length) {
                return res.status(404).json({ error: 'Menu item not found' });
            }

            // Check if item is referenced in any orders
            const [orderItems] = await pool.query(
                'SELECT * FROM restaurant_order_items WHERE ItemID = ?',
                [id]
            );

            if (orderItems.length > 0) {
                return res.status(400).json({ 
                    error: 'Cannot delete menu item as it is referenced in orders'
                });
            }

            await pool.query('DELETE FROM menu_items WHERE ItemID = ?', [id]);
            res.json({ message: 'Menu item deleted successfully' });
        } catch (error) {
            console.error('Error deleting menu item:', error);
            res.status(500).json({ error: error.message });
        }
    },

    deleteCategory: async (req, res) => {
        try {
            const { id } = req.params;
            await pool.query('DELETE FROM menu_categories WHERE CategoryID = ?', [id]);
            res.json({ message: 'Category deleted' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    updateCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const { Name } = req.body;
            await pool.query('UPDATE menu_categories SET Name = ? WHERE CategoryID = ?', [Name, id]);
            res.json({ message: 'Category updated' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = menuController;