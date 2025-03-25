import { RequestHandler } from "express";
import { Category } from "../entities/category";

export const createCategory:RequestHandler = async (req, res):Promise<any> => {
    try {
        const {name ,isActive}=req.body;
        if(!name || !isActive){
            return res.status(400).json({Error:"Please Fill All Fields"});
        }
        const categoryIsExisit = await Category.findOneBy({name});
        if(categoryIsExisit){
            return res.status(400).json({Error:`The Category '${name}' Is Exist'`});
        }
        const createCategory= await Category.create({
            name :name, 
            isActive:isActive,
        }).save();
        return res.status(200).json(createCategory)
    } catch (error:any) {
        console.log("Error in createCategory controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const updateCategory:RequestHandler = async (req, res):Promise<any> => {
    try {
        const categoryId :any = req.params.categoryId;
        const {name , isActive}= req.body;
        const isExistCategory = await Category.findOneBy({categoryId});
        if(!isExistCategory){
            return res.status(404).json({Error:"Not Found Category"});
        }
        if(name) isExistCategory.name=name;
        if(isActive) isExistCategory.isActive=isActive;
        await isExistCategory.save();
        return res.status(200).json(isExistCategory);
    } catch (error :any) {
        console.log("Error in updateCategory controller", error.message);
        res.status(500).json({error: "Internal server error"});
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
        return res.status(200).json(getAll);
    } catch (error :any) {
        console.log("Error in updateCategory controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}