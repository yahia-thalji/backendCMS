import { RequestHandler } from "express";
import { Product } from "../entities/product";
import { Cart } from "../entities/cart";
import { User } from "../entities/user";
import { CartItem } from "../entities/cartItem";
   
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

    const item = await CartItem.findOne({where:{id:itemId} , relations:['product']});

    // const cart = await Cart.findOne({
    //   where: {cartId:cartId},
    //   relations: ["items", "items.product"],
    // });

    if (!item) {
      return res.status(404).json({ message: "No Item" });
    }

    if (item.status === "accept" || item.status === "rejected") {
      return res.status(400).json({ message: `This order has already been ${item.status}.` });
    }

    if (status === "rejected") {
      item.status = "rejected";
      await item.save(); 
      return res.status(200).json({ message: "We are sorry, your order has been rejected." });
    }

      item.status = "accept";

      if (item.product.quantity < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${item.product.name}` });
      }
      item.product.quantity -= item.quantity;
      await item.product.save();
    

    await item.save();


    return res.status(200).json({ message: "Order has been accepted successfully!" });

  } catch (error: any) {
    console.error("Error in updateOrderStatus controller", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};



export const getAllOrders: RequestHandler = async (req, res): Promise<any> => {
  try {

    const orders = await Cart.find({relations:['user']});

    if (orders.length === 0) {
      return res.status(404).json({ message: "Not Found Any Order Yet" });
    }

    return res.status(200).json(orders);
  } catch (error: any) {
    console.error("Error in getOrders controller", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

