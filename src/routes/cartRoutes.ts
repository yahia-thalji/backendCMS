import express from 'express'
import { addToCart, changeQuantity, checkout, getAllOrders, getItemsCart, getItemsCartPending,  removeItem, updateOrderStatus } from '../controller/cartController';
import { IsAuthenticated, isAuthorized } from '../middleware/protectRoute';

const router = express.Router();



//Create a new order (cart) for a user ((when user press 'اشتري الان'))
router.post("/addToCart",IsAuthenticated,addToCart);

router.delete("/removeFromCart",IsAuthenticated,removeItem);
//get all orders when is in cart
router.get("/getCartItems",IsAuthenticated , getItemsCart);

//can access the admin only AND THIS CODE WE USING TO ANALYSIS DATA WHY PENDING NOT CHECKOUT
router.get("/getItemsCartPending",isAuthorized , getItemsCartPending);

router.post("/changeQuantity",IsAuthenticated,changeQuantity);

//when user press 'اتمام عملية الشراء' we convert status inCart to pending 
router.post("/checkout",IsAuthenticated,checkout);
//when user press 'الموافقة او الرفض على الشراء من الادمن' we convert status pending to accept or rejected 
router.post("/updateOrderStatus",isAuthorized,updateOrderStatus);

//Get all orders for an admin where status is accept or rejected or pending
router.get('/orders/admin',getAllOrders);
export default router;