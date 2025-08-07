import { RequestHandler } from "express";
import { Product } from "../entities/product";
import { Cart } from "../entities/cart";
import { User } from "../entities/user";
import { CartItem } from "../entities/cartItem";
import { createNotification, getAdminUsers } from "./notificationHelpers";
import { In } from "typeorm";
   
export const addToCart: RequestHandler = async (req, res): Promise<any> => {
    try {
        const user = (req as any).user;
        const UserID: any = user.userId;

        // Check if the user exists
        const userIsExist = await User.findOneBy({ UserID });
        if (!userIsExist) {
            return res.status(400).json({ message: "User not found" });
        }

        const { productId } = req.body;
        // Check if the product exists
        const product = await Product.findOne({where:{productId:productId}});
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check if the product has already been added to the cart for the same user
        const existingCartItem = await CartItem.findOne({
            where: { product: { productId: productId },status:"inCart", user: { UserID: UserID } },
            relations: ["product", "user"]
        });
        console.log(existingCartItem?.status);
        if (existingCartItem?.status=="inCart") {
            return res.status(400).json({ message: "The product is already exist in the cart" });
        }

        // Create a new cart item
        const cartItem = CartItem.create({
            user: userIsExist,
            product: product
        });

        await cartItem.save();

        return res.status(201).json({ message: "Product added to cart successfully", cartItem });

    } catch (error: any) {
        console.error("Error in addToCart controller", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};



export const removeItem:RequestHandler = async(req ,res): Promise <any> =>{
    try {
        const user = (req as any).user;
        const UserID: any = user.userId;

        // Check if the user exists
        const userIsExist = await User.findOneBy({ UserID });
        if (!userIsExist) {
            return res.status(400).json({ message: "User not found" });
        }

        const {id}=req.body;
        const cartItem= await CartItem.findOne({where:{id:id} , relations:['user']});
        if(!cartItem){
            return res.status(404).json({message:"Not Found item "})
        }
        if(cartItem.status!=="inCart"){
            return res.status(400).json({message:"Sorry is not in cart items"})
        }
        await cartItem.remove();
        return res.status(200).json({message:"The deletion process was completed successfully"})

    }  catch (error: any) {
        console.error("Error in removeItem controller", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const getItemsCart: RequestHandler = async (req, res): Promise<any> => {
    try {
      const user = (req as any).user;
      const UserID: any = user.userId;

      const userIsExist = await User.findOneBy({ UserID });
      if (!userIsExist) {
          return res.status(400).json({ message: "User not found" });
      }

      // Find the active cart (which is inCart) for the user
      const cart = await CartItem.find({
        where: { user: { UserID }, status: "inCart" },
        relations: ["user", "product"], // Add relationships with products
      });
  
      if (!cart) {
        return res.status(400).json({ message: "No active cart found" });
      }
  
      return res.status(200).json(cart);
    } catch (error: any) {
      console.error("Error in getCart controller", error.message);
      return res.status(500).json({ error: "Internal server error" });
    }
  };


  //can access the admin only AND THIS CODE WE USING TO ANALYSIS DATA WHY PENDING NOT CHECKOUT
  export const getItemsCartPending: RequestHandler = async (req, res): Promise<any> => {
    try {
      const user = (req as any).user;
      const UserID: any = user.userId;
  
      const userIsExist = await User.findOne({where:{UserID:UserID} , relations:['Role']});
      if (!userIsExist) {
          return res.status(400).json({ message: "User not found" });
      }
      if(userIsExist.Role.roleName !=="admin"){
        return res.status(403).json({message :"Your Not Allowed"})
      }

      const cart = await CartItem.find({
        where: {status: "pending" },
        relations: ["user", "product"],
      });
  
      if (!cart) {
        return res.status(400).json({ message: "No active cart found" });
      }
  
      return res.status(200).json(cart);
    } catch (error: any) {
      console.error("Error in getCart controller", error.message);
      return res.status(500).json({ error: "Internal server error" });
    }
  };


export const changeQuantity:RequestHandler = async (req , res):Promise<any> => {
  try {
    const user = (req as any).user;
    const UserID: any = user.userId;

    const userIsExist = await User.findOneBy({ UserID });
    if (!userIsExist) {
        return res.status(400).json({ message: "User not found" });
    }

    const {itemId ,quantity} = req.body;
    console.log("itemId",itemId);
    console.log("quantity",quantity);
    const item = await CartItem.findOne({where:{id:itemId}});
    if(!item){
      return res.status(404).json({message:"Not Found Item"});
    }
    console.log("itemId",itemId);
    console.log("\n");
    console.log("quantity",quantity);
    item.quantity =quantity;
    await item.save();
    return res.status(200).json({message:"updated successfully"})
  } catch (error: any) {
    console.error("Error in changeQuantity controller", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export const checkout: RequestHandler = async (req, res): Promise<any> => {
  try {
    const user = (req as any).user;
    const UserID: any = user.userId;

    const userIsExist = await User.findOne({ where: { UserID: UserID } });
    if (!userIsExist) {
      return res.status(400).json({ message: "User not found" });
    }

    const cartItems = await CartItem.find({
      where: { user: { UserID }, status: "inCart" },
      relations: ["user", "product"], 
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    for (const item of cartItems) {
      item.status = "pending";
      await item.save();
    }

    const products = cartItems.map(item => item.product);

    const newCart = Cart.create({
      user: userIsExist,
      items: cartItems,
      product: products,
      orderTotalPrice: cartItems.reduce((total, item) => total + Number(item.product.price) * item.quantity, 0),
      orderDiscountPrice: cartItems.reduce((total, item) => total + Number(item.product.newPrice) * item.quantity, 0),
    });

    await newCart.save();
// After checkout
    const adminUsers = await getAdminUsers();
    for (const admin of adminUsers) {
      await createNotification(
        `New Order #${newCart.cartId}`,
        "new_order",
        userIsExist,
        admin
      );
    }
    return res.status(200).json({ message: "Purchased successfully", cart: newCart });

  } catch (error: any) {
    console.error("Error in checkout controller", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const updateOrderStatus: RequestHandler = async (req, res): Promise<any> => {
  try {
    const { itemId, status } = req.body;

    if (!["accept", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Find the item with all necessary relations
    const item = await CartItem.findOne({ 
      where: { id: itemId }, 
      relations: ['product', 'cart', 'user'] // Added 'user' relation for notification
    });

    if (!item) {
      return res.status(404).json({ message: "No Item found" });
    }

    if (item.status === "accept" || item.status === "rejected") {
      return res.status(400).json({ message: `This order has already been ${item.status}.` });
    }

    // Get the current user (admin) making the update
    const adminUser = (req as any).user;

    if (status === 'accept') {
      item.status = 'accept';
      item.deliveredAt = new Date();
    } else {
      item.status = 'rejected';
      item.cart.orderTotalPrice -= item.product.price;
      item.cart.orderDiscountPrice -= item.product.newPrice ? item.product.newPrice : 0;
    }

    await item.save();
    await item.cart.save();

    // Send notification to the user who placed the order
const message = "تم تحديث طلبك، قم بمراجعة صفحة 'طلباتي'";

await createNotification(
  message,
  "order_status",
  adminUser, // المستخدم الإداري الذي قام بالتحديث
  item.user   // المستخدم الذي قدم الطلب
);


    return res.status(200).json({ 
      message: 'Status updated successfully!',
      newStatus: status
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error updating status' });
  }
};


export const getAllOrders: RequestHandler = async (req, res): Promise<any> => {
  try {
    const orders = await Cart.find({
      relations: ['user'],
      select: {
        cartId: true,
        orderTotalPrice: true,
        orderDiscountPrice: true,
        createdAt: true,
      },
      order:{
        cartId:"desc"
      }
    });

    if (orders.length === 0) {
      return res.status(404).json({ message: "Not Found Any Order Yet" });
    }

    const filteredOrders = orders.map(order => ({
      cartId: order.cartId,
      orderTotalPrice: order.orderTotalPrice,
      orderDiscountPrice: order.orderDiscountPrice,
      createdAt: order.createdAt,
      firstName: order.user?.firstName,
      lastName: order.user?.lastName
    }));

    return res.status(200).json(filteredOrders);
  } catch (error: any) {
    console.error("Error in getOrders controller", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const getOrderWithItems: RequestHandler = async (req, res): Promise<any> => {
  try {
    const cartId: any = req.params.cartId;
    console.log(cartId);
    if (!cartId) {
      return res.status(400).json({ error: "Please provide a valid cartId" });
    }

    const cartItems = await CartItem.find({
      where: { cart: { cartId: cartId } },
      relations: ["user", "cart", "product"],
    });

    if (!cartItems || cartItems.length === 0) {
      return res.status(404).json({ message: "No cart items found" });
    }

    const filteredItems = cartItems.map((item) => ({
      cart: {
        cartId: item.cart.cartId,
        orderTotalPrice: item.cart.orderTotalPrice,
        orderDiscountPrice: item.cart.orderDiscountPrice,
      },
      user: {
        UserID: item.user.UserID,
        firstName: item.user.firstName,
        lastName: item.user.lastName,
        address: item.user.address,
        phoneNumber: item.user.phoneNumber,
        email: item.user.email,
        gender: item.user.gender,
      },
      product: {
        productId: item.product.productId,
        name: item.product.name,
        quantity: item.product.quantity,
        price: item.product.price,
        newPrice: item.product.newPrice,
        cartItem: {
          quantity: item.quantity,
          status: item.status,
          itemId: item.id
        },
      },
    }));

    return res.status(200).json(filteredItems);
  } catch (error: any) {
    console.error("Error in getOrderWithItems controller", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getMyOrder: RequestHandler = async (req, res): Promise<any> => {
  try {
    const user = (req as any).user;
    const UserID: any = user.userId;

    const userIsExist = await User.findOne({ where: { UserID: UserID } });
    if (!userIsExist) {
      return res.status(400).json({ message: "User not found" });
    }

    const cartItems = await CartItem.createQueryBuilder('cartItem')
      .leftJoinAndSelect('cartItem.product', 'product')
      .leftJoinAndSelect('cartItem.cart', 'cart')
      .leftJoinAndSelect('cartItem.user', 'user')
      .select([
        'cart.cartId',
        'cartItem.quantity',
        'cartItem.status',
        'cartItem.createdAt',
        'product.name',
        'product.price',
        'product.newPrice'
      ])
      .where('user.UserID = :UserID', { UserID })
      .andWhere('cartItem.status IN (:...statuses)', { 
        statuses: ['pending', 'accept' , 'rejected'] 
      })
      .orderBy('cartItem.createdAt', 'DESC')
      .getMany();

    return res.status(200).json(cartItems);

  } catch (error: any) {
    console.log("Error in getMyOrder controller", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};