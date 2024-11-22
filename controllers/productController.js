import { query } from '../database/db.js';

export const getProducts = async (req, res) => {
    try {
        const products = await query('SELECT * FROM product');

        // Convert image BLOB to Base64
        const productsWithImages = products.map(product => ({
            ...product,
            image: product.image ? product.image.toString('base64') : null,
        }));

        res.status(200).json(productsWithImages);
    } catch (err) {
        console.error('Error fetching products:', err.message);
        res.status(500).json({ message: 'Failed to fetch products.', error: err.message });
    }
};

