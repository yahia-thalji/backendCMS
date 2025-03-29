import express from 'express'
import { addToCart, getItemsCart, getItemsCartPending, removeItem } from '../controller/cartController';
import { IsAuthenticated, isAuthorized } from '../middleware/protectRoute';

const router = express.Router();



//Create a new order (cart) for a user ((when user press 'اشتري الان'))
router.post("/addToCart",IsAuthenticated,addToCart);

router.delete("/removeFromCart",IsAuthenticated,removeItem);
//get all orders when is in cart
router.get("/getCartItems",IsAuthenticated , getItemsCart);

//can access the admin only AND THIS CODE WE USING TO ANALYSIS DATA WHY PENDING NOT CHECKOUT
router.get("/getItemsCartPending",isAuthorized , getItemsCartPending);


//when user press 'اتمام عملية الشراء' we convert status inCart to pending 
router.post("/checkout");
//when user press 'الموافقة او الرفض على الشراء من الادمن' we convert status pending to accept or rejected 
router.post("/updateOrderStatus");

//Get all orders for an admin where status is accept or rejected or pending
router.get('/orders/admin');
export default router;