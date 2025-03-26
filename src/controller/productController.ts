import {RequestHandler} from 'express'
import { Product } from '../entities/product';
import { Category } from '../entities/category';

export const createProduct:RequestHandler = async (req,res):Promise<any> => {
    try {
        const {name , description , quantity ,categoryId,price ,newPrice}=req.body;
        if(!name || !description || !quantity|| !price || !categoryId){
            return res.status(400).json({message:"Something Is Wrong !"});
        }
        const categoryIsExist = await Category.findOneBy({categoryId});
        if(!categoryIsExist){
            return res.status(400).json({message:"Not Found Category"})
        }
        const addProduct = Product.create({
            name,
            description,
            quantity,
            price:price,
            newPrice: newPrice || null ,
            category:categoryIsExist
        });
        if (newPrice && newPrice >= price) {
            return res.status(400).json({ message: "New price must be lower than the original price" });
        }
        // const discountPercentage = newPrice ? ((price - newPrice) / price) * 100 : null;
        // console.log(discountPercentage);
        await addProduct.save();
        return res.status(200).json(addProduct );
    } catch (error:any) {
        console.log("Error in createProduct controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}