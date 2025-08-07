import express from 'express';
import { getBrandsWithFilters, getCategoriesWithFilters, searchProducts } from '../controller/searchController';

const router = express.Router();

// البحث المتقدم في المنتجات
router.get('/products', searchProducts);

// الحصول على البراندات مع إمكانية الفلترة
router.get('/brands', getBrandsWithFilters);

// الحصول على الفئات مع إمكانية الفلترة
router.get('/categories', getCategoriesWithFilters);

export default router;