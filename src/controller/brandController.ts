import { RequestHandler } from "express";
import { Brand } from "../entities/brand";
import { Resources } from "../entities/resources";
import fs from "fs";
import { database } from "../config/connectPgDB";

export const addBrand: RequestHandler = async (req, res): Promise<any> => {
    try {
        if (!database.isInitialized) {
            await database.initialize();
        }

        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Please enter name" });
        }

        const existingBrand = await Brand.findOneBy({ name });
        if (existingBrand) {
            return res.status(400).json({ message: `The brand "${name}" already exists` });
        }

        const newBrand = Brand.create({ name });
        await newBrand.save();

        if (!req.file) {
            return res.status(400).json({ message: "File is required" });
        }

        const newResource = new Resources();
        newResource.filePath = req.file.path;
        newResource.fileType = req.file.mimetype;
        newResource.entityName = req.file.filename;
        newResource.brand = newBrand;

        await newResource.save();
        newBrand.resources = newResource;
        await newBrand.save();

        return res.status(201).json({
            brandId: newBrand.brandId,
            name: newBrand.name,
            resources: {
              resourceID: newResource.resourceID,
              filePath: newResource.filePath,
              fileType: newResource.fileType,
              entityName: newResource.entityName
            }
        });
    } catch (error: any) {
        console.error("Error in addBrand controller:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const updateBrand: RequestHandler = async (req, res): Promise<any> => {
    try {
        const brandId: any = req.params.brandId;
        const { name } = req.body;

        const brand = await Brand.findOne({
            where: { brandId },
            relations: ['resources'],
        });

        if (!brand) {
            return res.status(404).json({ message: "Brand not found" });
        }

        // تحقق من تكرار الاسم قبل تعديله
        if (name && name !== brand.name) {
            const existingBrand = await Brand.findOneBy({ name });
            if (existingBrand) {
                return res.status(400).json({ message: `The name "${name}" is already used by another brand.` });
            }
            brand.name = name;
        }

        // إذا تم إرسال ملف جديد
        if (req.file) {
            const resource = brand.resources;

            // حذف الملف القديم إن وُجد
            if (resource?.filePath && fs.existsSync(resource.filePath)) {
                fs.unlinkSync(resource.filePath);
            }

            if (resource) {
                // تحديث المورد
                resource.filePath = req.file.path;
                resource.fileType = req.file.mimetype;
                resource.entityName = req.file.filename;
                await resource.save();
            } else {
                // إنشاء مورد جديد
                const newResource = new Resources();
                newResource.filePath = req.file.path;
                newResource.fileType = req.file.mimetype;
                newResource.entityName = req.file.filename;
                newResource.brand = brand;
                await newResource.save();
                brand.resources = newResource;
            }
        }

        await brand.save();

        return res.status(200).json({
            message: "Brand updated successfully",
            brandId: brand.brandId,
            name: brand.name,
            resources: brand.resources
                ? {
                    resourceID: brand.resources.resourceID,
                    filePath: brand.resources.filePath,
                    fileType: brand.resources.fileType,
                    entityName: brand.resources.entityName,
                }
                : null
        });

    } catch (error: any) {
        console.log("Error in updateBrand controller", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};




export const deleteBrand: RequestHandler = async (req, res): Promise<any> => {
    try {
        const brandId :any= req.params.brandId;

        // تحقق من وجود العلامة التجارية
        const brand = await Brand.findOne({
            where: { brandId },
            relations: ['resources'],
        });

        if (!brand) {
            return res.status(404).json({ message: "Brand not found" });
        }

        // إذا كانت العلامة التجارية تحتوي على مورد
        if (brand.resources) {
            // حذف الملف المرتبط بالمورد من النظام
            if (fs.existsSync(brand.resources.filePath)) {
                fs.unlinkSync(brand.resources.filePath);
            }

            // حذف المورد من قاعدة البيانات
            await Resources.remove(brand.resources);
        }

        // الآن يمكن حذف العلامة التجارية لأنها لم تعد مرتبطة بأي مورد
        await Brand.remove(brand);

        return res.status(200).json({ message: "Brand deleted successfully" });

    } catch (error: any) {
        console.log("Error in deleteBrand controller", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};



export const getAllBrands: RequestHandler = async (req, res): Promise<any> => {
    try {
        // جلب جميع العلامات التجارية مع المورد المرتبط بكل علامة
        const brands = await Brand.find({
            relations: ['resources'], // جلب المورد المرتبط بكل علامة تجارية
        });

        if (brands.length === 0) {
            return res.status(404).json({ message: "No brands found" });
        }

        // إرجاع العلامات التجارية مع الموارد المرتبطة بها
        return res.status(200).json(brands);

    } catch (error: any) {
        console.log("Error in getAllBrands controller", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getABrand:RequestHandler = async (req , res):Promise<any> => {
    try {
        const brandId:any = req.params.brandId;
        if(!brandId){
            return res.status(400).json({message:"something is wrong !"})
        }

        const brand = await Brand.findOne({where:{brandId:brandId},relations:['resources']});
        if(!brand){
            return res.status(404).json({message:"not Found"});
        }

        return res.status(200).json(brand);

    } catch (error:any) {
        console.log("Error in getABrand controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}