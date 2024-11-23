import { query } from '../database/db.js';

export const createOrder = async (req, res) => {
    const { cart } = req.body;
    const userId = req.userId; // Retrieve userId from middleware

    if (!cart || cart.length === 0) {
        return res.status(400).json({ message: 'Cart cannot be empty.' });
    }

    console.log('Received userId:', userId);
    console.log('Received cart:', cart);

    try {
        const result = await query('INSERT INTO `orders` (user_id) VALUES (?)', [userId]);
        const orderId = Number(result.insertId);

        const orderItems = cart.map(item => [
            orderId,
            userId,
            item.productId,
            item.quantity,
        ]);

        console.log('Prepared order items:', orderItems);

        for (const item of orderItems) {
            await query(
                'INSERT INTO order_items (order_id, user_id, product_id, quantity) VALUES (?, ?, ?, ?)',
                item
            );
        }


        res.status(201).json({ message: 'Order placed successfully.' });
    } catch (err) {
        console.error('Error placing order:', err.message);
        res.status(500).json({ message: 'Failed to place order.', error: err.message });
    }
};

export const getOrders = async (req, res) => {
    const userId = req.userId;

    try {
        const orders = await query(
            'SELECT o.order_id, o.order_date, oi.product_id, oi.quantity, p.title, CAST(p.price AS DECIMAL(10,2)) AS price ' +
            'FROM `orders` o ' +
            'JOIN order_items oi ON o.order_id = oi.order_id ' +
            'JOIN product p ON oi.product_id = p.product_id ' +
            'WHERE o.user_id = ? ORDER BY o.order_date DESC',
            [userId]
        );

        const groupedOrders = orders.reduce((acc, order) => {
            const { order_id, order_date, product_id, quantity, title, price } = order;
            if (!acc[order_id]) {
                acc[order_id] = {
                    orderId: order_id,
                    orderDate: order_date,
                    items: [],
                };
            }
            acc[order_id].items.push({ productId: product_id, title, price, quantity });
            return acc;
        }, {});

        res.status(200).json(Object.values(groupedOrders));
    } catch (err) {
        console.error('Error fetching orders:', err.message);
        res.status(500).json({ message: 'Failed to fetch orders.', error: err.message });
    }
};


