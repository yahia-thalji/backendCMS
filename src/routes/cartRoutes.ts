import express from 'express'

const router = express.Router();

//when user press 'اتمام عملية الشراء' we convert status inCart to pending 
router.post("/checkout");
//when user press 'الموافقة او الرفض على الشراء من الادمن' we convert status pending to accept or rejected 
router.post("/acceptOrRejected");

//Create a new order (cart) for a user ((when user press 'اشتري الان'))
router.post("/order");

//Update a specific product order(cart)
router.post('/order/:orderId/:productId');

//Delete a specific product order(cart)
router.delete('/:orderId/:productId')

//get all orders when is in cart
router.get("/ordersInCart");

//Get all orders for an admin where status is accept or rejected or pending
router.get('/orders/admin');
export default router;