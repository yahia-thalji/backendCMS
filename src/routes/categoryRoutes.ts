import express from 'express'
import { createCategory, deleteCategory, getAll, updateCategory } from '../controller/categoryController';

const router = express.Router();

router.post("/create",createCategory);
router.post("/update/:categoryId",updateCategory);
router.delete("/delete/:categoryId",deleteCategory);

router.get("/getAll",getAll);

export default router