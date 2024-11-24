import express from 'express';
import { createOrder, getOrders, deleteFromCart } from '../controllers/cartOrderController.js';
import { validateToken } from '../middleware/authMiddleware.js'; // Import the middleware

const router = express.Router();

router.post('/', validateToken, createOrder); // Use the middleware here
router.get('/', validateToken, getOrders);
router.delete('/cart/:productId', deleteFromCart);

export default router;
