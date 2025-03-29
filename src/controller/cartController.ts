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
            where: { product: { productId: productId }, user: { UserID: UserID } },
            relations: ["product", "user"]
        });
        
        if (existingCartItem) {
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



// export const checkout: RequestHandler = async (req, res): Promise<any> => {
//     try {
//         const user = (req as any).user;
//         const UserID: any = user.userId;

//         // Find the user's cart that contains products in inCart status
//         const cart = await Cart.findOne({ 
//             where: { user: { UserID }, status: "inCart" }, 
//             relations: ["user", "cartItems"] // ✅ Add cartItems
//         });

//         if (!cart) {
//             return res.status(400).json({ message: "No items in cart to checkout" });
//         }

//         if (cart.items.length === 0) { // ✅ Make sure the basket is not empty
//             return res.status(400).json({ message: "Cart is empty" });
//         }

//        // Update the request status to pending
//         cart.status = "pending";
//         await cart.save();

//         return res.status(200).json({ message: "Checkout successful", cart });

//     } catch (error: any) {
//         console.error("Error in checkout controller", error.message);
//         return res.status(500).json({ error: "Internal server error" });
//     }
// };


// export const updateOrderStatus: RequestHandler = async (req, res): Promise<any> => {
//     try {
//         const { cartId, status } = req.body;

//         if (!["accept", "rejected"].includes(status)) {
//             return res.status(400).json({ message: "Invalid status value" });
//         }

//         const cart = await Cart.findOne({ where: { cartId }, relations: ["cartItems", "cartItems.product"] });

//         if (!cart) {
//             return res.status(404).json({ message: "Cart not found" });
//         }

//         if (cart.status !== "pending") {
//             return res.status(400).json({ message: "Order is not in pending status" });
//         }

//         cart.status = status;

//         if (status === "accept") {
//             for (const cartItem of cart.items) {
//                 if (cartItem.product.quantity < cartItem.quantity) {
//                     return res.status(400).json({ message: `Not enough stock for ${cartItem.product.name}` });
//                 }
//                 cartItem.product.quantity -= cartItem.quantity;
//                 await Product.save(cartItem.product);
//             }
//         }

//         await cart.save();

//         return res.status(200).json({ message: `Order status updated to ${status}`, cart });

//     } catch (error: any) {
//         console.error("Error in updateOrderStatus controller", error.message);
//         return res.status(500).json({ error: "Internal server error" });
//     }
// };
