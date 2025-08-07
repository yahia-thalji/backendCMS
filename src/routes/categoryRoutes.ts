import express from 'express'
import { createCategory, deleteCategory, getACategory, getAll, updateCategory } from '../controller/categoryController';

const router = express.Router();

router.post("/create",createCategory);
router.post("/update/:categoryId",updateCategory);
router.delete("/delete/:categoryId",deleteCategory);

router.get("/getACategory/:categoryId",getACategory);
router.get("/getAll",getAll);

export default router