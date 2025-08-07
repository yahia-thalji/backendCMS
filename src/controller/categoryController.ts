import { RequestHandler } from "express";
import { Category } from "../entities/category";

export const createCategory: RequestHandler = async (req, res): Promise<any> => {
    try {
        const { name, isActive } = req.body;

        // Validate required fields
        if (!name || typeof isActive === 'undefined') {
            return res.status(400).json({ Error: "Please fill all fields" });
        }

        // Ensure isActive is a boolean
        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ Error: "'isActive' must be a boolean" });
        }

        // Check if category already exists
        const categoryExists = await Category.findOneBy({ name });
        if (categoryExists) {
            return res.status(400).json({ Error: `The category '${name}' already exists` });
        }

        // Create the new category and save it
        const newCategory = Category.create({
            name,
            isActive
        });

        // Save the new category to the database
        await newCategory.save();

        // Send response with the created category
        return res.status(200).json(newCategory);
    } catch (error: any) {
        console.log("Error in createCategory controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
export const updateCategory: RequestHandler = async (req, res): Promise<any> => {
    try {
        const categoryId: any = req.params.categoryId;
        const { name, isActive } = req.body;

        const isExistCategory = await Category.findOneBy({ categoryId });
        if (!isExistCategory) {
            return res.status(404).json({ Error: "Not Found Category" });
        }

        if (name) isExistCategory.name = name;
        
        // تحقق إذا كان isActive موجود في الطلب وليس فقط true أو false
        if (req.body.hasOwnProperty('isActive')) {
            isExistCategory.isActive = isActive; // هذه القيمة ستكون إما true أو false
        }

        await isExistCategory.save();
        return res.status(200).json(isExistCategory);
    } catch (error: any) {
        console.log("Error in updateCategory controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}


export const deleteCategory:RequestHandler = async (req, res):Promise<any> => {
    try {
        const categoryId :any = req.params.categoryId;
        const isExistCategory = await Category.findOneBy({categoryId});
        if(!isExistCategory){
            return res.status(404).json({Error:"Not Found Category"});
        }
        await isExistCategory.remove();
        return res.status(200).json({message:"has been successfully"});
    } catch (error :any) {
        console.log("Error in updateCategory controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}


export const getAll:RequestHandler = async(req ,res):Promise<any> =>{
    try {
        const getAll = await Category.find();
        if(!getAll){
            return res.status(400).json({message:"Not Found Any Category"});
        }
        if(getAll.length===0){
           return res.status(200).json({message:"No Any Category In Repository"});
        }
        return res.status(200).json(getAll);
    } catch (error :any) {
        console.log("Error in updateCategory controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const getACategory:RequestHandler = async (req , res):Promise<any> => {
    try {
        const categoryId :any= req.params.categoryId;
        if(!categoryId){
            return res.status(404).json({message:"please enter the category id"})
        }
        const category = await Category.findOneBy({categoryId});
        if(!category){
            return res.status(404).json({message:"opes not found a category"})
        }
        return res.status(200).json(category);
    } catch (error:any) {
        console.log("Error in getACategory controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}