import express from 'express'

const router = express.Router();

router.post("/create");
router.post("/update/:categoryId");
router.delete("/:categoryId");

router.get("/categoryWithProduct");
router.get("/getAll");

export default router