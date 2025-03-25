import express from 'express'

const router = express.Router();

router.post("/createProduct",);

router.post("/update/:productId",);
router.delete("delete/:productId",);

//get single product
router.get('/:ProductId', );
router.get("/categoryWithProduct");

router.get("/getAllProducts",);

router.get("/categoryId/AllProduct",);

export default router;