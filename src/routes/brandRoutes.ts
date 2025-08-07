import express from 'express'
import { uploadSingle } from '../middleware/multerMiddleware';
import { addBrand, deleteBrand, getABrand, getAllBrands, updateBrand } from '../controller/brandController';

const router = express.Router();
//add
router.post("/addBrand",uploadSingle , addBrand)

//update
router.post("/updateBrand/:brandId",uploadSingle,updateBrand)

//delete
router.delete("/removeBrand/:brandId",deleteBrand)

//get all
router.get("/getAllBrands",getAllBrands)
//get a brand
router.get("/getABrand/:brandId",getABrand)


export default router;

