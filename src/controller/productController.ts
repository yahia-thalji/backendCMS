import {RequestHandler} from 'express'
import { Product } from '../entities/product';
import { Category } from '../entities/category';
import { ProgramUpdateLevel } from 'typescript/lib/typescript';
import { Resources } from '../entities/resources';

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
        if(quantity <0){
            return res.status(400).json({message:"quantity must be positive number"})
        }

        // Safely access req.files and handle cases where it might be undefined
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const images = files?.['images'] ?? [];
        // Check if both arrays are empty
        if (images.length === 0) {
            return res.status(400).send({ message: "Please provide one image " });
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

        for (const image of images) {
            const resource = Resources.create({
                entityName: image.filename,
                filePath: image.path,
                fileType: image.mimetype,
                product: addProduct,
            });
            await resource.save();
        }
        
        
        return res.status(201).json(addProduct );
    } catch (error:any) {
        console.log("Error in createProduct controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}


export const updateProduct:RequestHandler = async (req,res):Promise<any> => {
    try {
        const productId :any= req.params.productId;
        const product= await Product.findOneBy({productId});
        if(!product){
            return res.status(400).json({messaga:"Not Found Product"});
        }
        const {name , description , quantity ,categoryId,price ,newPrice}=req.body;
        if(categoryId){
        const categoryIsExist = await Category.findOneBy({categoryId});
        if(!categoryIsExist){
            return res.status(400).json({message:"Not Found Category"})
        }else{
            product.category=categoryIsExist;
        }
    }
        if(name) product.name = name;
        if(description) product.description=description;
        if(quantity && quantity<0) {
            return res.status(400).json({message :"if want change the quantity be must positive number"})
        }else{
            product.quantity=quantity;
        }
        if(price && price >0) product.price=price;
        if (newPrice) {
            if (product.price && newPrice >= product.price) {
                return res.status(400).json({ message: "New price must be lower than the original price" });
            }
            product.newPrice = newPrice;
        }
        await product.save();
        return res.status(200).json(product);
    } catch (error:any) {
        console.log("Error in updateProduct controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const deleteProduct:RequestHandler = async(req ,res):Promise <any> =>{
    try {
        const productId :any = req.params.productId;
        const product = await Product.findOneBy({productId});
        if(!product){
            return res.status(400).json({message : "Not Found Product"});
        }
        await product.remove();
        return res.status(200).json({message:"The deletion process has been completed"})
    } catch (error:any) {
        console.log("Error in deleteProduct controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const getProduct:RequestHandler = async(req ,res ):Promise<any> =>{
    try {
        const productId :any = req.params.productId;
        const product = await Product.findOneBy({productId});
        if(!product){
            return res.status(400).json({message:"Not Found Product"});
        }
        return res.status(200).json(product);
    } catch (error:any) {
        console.log("Error in getProduct controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const getAllProducts:RequestHandler = async(req ,res):Promise<any> =>{
    try {
        const products = await Product.find();
        if(!products){
            return res.status(400).json({message:"Not Found Products"})
        }
        if(products.length===0){
            return res.status(404).json({message:"No Product Yet"})
        }
        return res.status(200).json(products);
    } catch (error:any) {
        console.log("Error in getAllProducts controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const categoryWithProduct:RequestHandler = async (req ,res):Promise<any> => {
    try {
        const categoryWithProduct = await Product.find({relations:['category']});
        if(!categoryWithProduct){
            return res.status(400).json({message:"Not Found categoryWithProduct"})
        }
        if(categoryWithProduct.length===0){
            return res.status(200).json({message:"No Product Yet"})
        }
        return res.status(200).json(categoryWithProduct);
    } catch (error:any) {
        console.log("Error in categoryWithProduct controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}


export const categoryIdWithAllProducts:RequestHandler = async(req ,res):Promise<any> =>{
    try {
        const categoryId :any=req.params.categoryId;

        const category = await Category.find({where:{categoryId:categoryId} ,relations:['product']});
        if(!category){
            return res.status(400).json({message:"Not Found category"});
        }

        return res.status(200).json(category);
        
    } catch (error:any) {
        console.log("Error in pIdCId controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}