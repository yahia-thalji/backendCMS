import express from 'express'
import { categoryIdWithAllProducts, categoryWithProduct, createProduct, deleteProduct, getAllProducts, getProduct, updateProduct } from '../controller/productController';
import { uploadFields } from '../middleware/multerMiddleware';

const router = express.Router();

router.post("/createProduct",uploadFields,createProduct);

router.post("/update/:productId",uploadFields,updateProduct);
router.delete("/delete/:productId",deleteProduct);

//get single product
router.get('/getProduct/:productId', getProduct);
router.get("/categoryWithProduct",categoryWithProduct);

router.get("/getAllProducts",getAllProducts);

router.get("/:categoryId/AllProduct",categoryIdWithAllProducts);

export default router;