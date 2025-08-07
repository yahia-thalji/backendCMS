import {RequestHandler} from 'express'
import { Product } from '../entities/product';
import { Category } from '../entities/category';
import { Brand } from '../entities/brand';
import { ProgramUpdateLevel } from 'typescript/lib/typescript';
import { Resources } from '../entities/resources';
import { CartItem } from '../entities/cartItem';

import path from 'path';
const fs = require('fs');

export const createProduct:RequestHandler = async (req,res):Promise<any> => {
    try {
        // console.log("createProduct");
        const {name , description , quantity ,categoryId , brandId,price ,newPrice ,howToUse}=req.body;
        if(!name || !description || !quantity|| !price || !categoryId ||!howToUse){
            return res.status(400).json({message:"Something Is Wrong !"});
        }
        const categoryIsExist = await Category.findOneBy({categoryId});
        if(!categoryIsExist){
            return res.status(400).json({message:"Not Found Category"})
        }
        if(quantity <0){
            return res.status(400).json({message:"quantity must be positive number"})
        }
        let brand = null;
        if (brandId) {
          brand = await Brand.findOneBy({ brandId });
          if (!brand) {
            return res.status(400).json({ message: "Brand not found" });
          }
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
            howToUse,
            category:categoryIsExist,
            brand: brand || undefined,
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


export const updateProduct: RequestHandler = async (req, res): Promise<any> => {
    try {
        const productId: any = req.params.productId;
        const product = await Product.findOne({ where: { productId: productId } });

        if (!product) {
            return res.status(400).json({ message: "Product not found" });
        }

        const { name, description, quantity, categoryId,brandId ,price, newPrice ,howToUse} = req.body;

        if (categoryId) {
            const categoryIsExist = await Category.findOneBy({ categoryId });
            if (!categoryIsExist) {
                return res.status(400).json({ message: "Category not found" });
            } else {
                product.category = categoryIsExist;
            }
        }
        if (brandId) {
            const brand = await Brand.findOneBy({ brandId });
            if (!brand) {
              return res.status(400).json({ message: "Brand not found" });
            }else{
                product.brand = brand;
            }
          }

        // تحديث بيانات المنتج أولاً
        if ('name' in req.body) product.name = name;
        if ('description' in req.body) product.description = description;
        if ('howToUse' in req.body) product.howToUse = howToUse;
        if ('quantity' in req.body) {
            if (quantity < 0) {
                return res.status(400).json({ message: "Quantity must be a positive number" });
            }
            product.quantity = quantity;
        }

        if ('price' in req.body) {
            if (price <= 0) {
                return res.status(400).json({ message: "Price must be greater than 0" });
            }
            product.price = price;
        }

        if ('newPrice' in req.body) {
            if (typeof product.price === 'number' && newPrice >= product.price) {
                return res.status(400).json({ message: "New price must be lower than the original price" });
            }
            product.newPrice = newPrice;
        }


        // حفظ المنتج أولاً
        await product.save();

        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const images = files?.['images'] ?? [];

        // إذا كانت هناك صور جديدة، نقوم بحفظها بعد حفظ المنتج
        if (images.length > 0) {
            // حذف الصور القديمة المرتبطة بالمنتج
            await Resources.delete({ product: productId });

            // إضافة الصور الجديدة وربطها بالمنتج
            for (const image of images) {
                const newResource = Resources.create({
                    entityName: image.filename,
                    filePath: image.path,
                    fileType: image.mimetype,
                    product: product,  // ربط الصورة بالمنتج هنا
                });

                // حفظ الصورة
                await newResource.save();
            }
        }

        // إعادة المنتج المحدث مع الصور الجديدة
        return res.status(200).json(product);

    } catch (error: any) {
        console.log("Error in updateProduct controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};




export const deleteProduct: RequestHandler = async (req, res): Promise<any> => {
    try {
      const productId: any = req.params.productId;
      
      // البحث عن المنتج
      const product = await Product.findOne({ where: { productId }, relations: ['resources', 'cartItems'] });
      if (!product) {
        return res.status(400).json({ message: "Product not found" });
      }
  
      // حذف الكائنات المرتبطة مثل Resources و CartItems يدويًا
      await Resources.delete({ product: product });
      await CartItem.delete({ product: product });
  
      // الآن، حذف المنتج نفسه
      await product.remove();
  
      return res.status(200).json({ message: "The deletion process has been completed" });
    } catch (error: any) {
      console.log("Error in deleteProduct controller", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  };

export const getProduct:RequestHandler = async(req ,res ):Promise<any> =>{
    try {
        const productId :any = req.params.productId;
        const product = await Product.findOne({where:{productId},relations:['category']});
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
        const products = await Product.find({
            relations:['brand'],
            order:{
                productId:'ASC'
            }
        });
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



export const functionName:RequestHandler = async (req , res):Promise<any> => {
    try {
        
    } catch (error:any) {
        console.log("Error in functionName controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}