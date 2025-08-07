import { RequestHandler } from 'express';
import { Brand } from '../entities/brand';
import { Category } from '../entities/category';
import { Product } from '../entities/product';
import { Between, In, Like, Not, IsNull } from 'typeorm';

interface ProductSearchFilters {
    searchTerm?: string;
    categoryIds?: number[];
    brandIds?: number[];
    minPrice?: number;
    maxPrice?: number;
    hasDiscount?: boolean;
    minRating?: number;
    sortBy?: 'price' | 'discount' | 'rating' | 'popularity';
    sortOrder?: 'ASC' | 'DESC';
    inStock?: boolean;
    limit?: number;
    page?: number;
}

// دالة البحث عن المنتجات مع الفلترة
export const searchProducts: RequestHandler = async (req, res): Promise<any> => {
    try {
        const {
            searchTerm,
            categoryIds,
            brandIds,
            minPrice,
            maxPrice,
            hasDiscount,
            minRating,
            sortBy = 'popularity',
            sortOrder = 'DESC',
            inStock,
            limit = 20,
            page = 1
        } = req.query as unknown as ProductSearchFilters;

        // التحقق من صحة المدخلات
        if (limit > 100) {
            return res.status(400).json({ error: "Maximum limit is 100" });
        }

        // بناء استعلام البحث
        const queryBuilder = Product.createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.brand', 'brand')
            .leftJoinAndSelect('product.resources', 'resources')
            .leftJoinAndSelect('product.review', 'review')
            .loadRelationCountAndMap('product.reviewCount', 'product.review');

        // تطبيق فلاتر البحث
        if (searchTerm) {
            queryBuilder.where([
                { name: Like(`%${searchTerm}%`) },
                { description: Like(`%${searchTerm}%`) },
                { howToUse: Like(`%${searchTerm}%`) }
            ]);
        }

        if (categoryIds?.length) {
            queryBuilder.andWhere({ category: { categoryId: In(categoryIds) } });
        }

        if (brandIds?.length) {
            queryBuilder.andWhere({ brand: { brandId: In(brandIds) } });
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            queryBuilder.andWhere({ 
                price: Between(minPrice || 0, maxPrice || 999999) 
            });
        }

        if (hasDiscount) {
            queryBuilder.andWhere({ newPrice: Not(IsNull()) });
        }

        if (minRating !== undefined) {
            queryBuilder.andWhere('product.AvgRating >= :minRating', { minRating });
        }

        if (inStock !== undefined) {
            queryBuilder.andWhere('product.status != :status', { 
                status: 'out of stock' 
            });
        }

        // تطبيق الترتيب
        switch (sortBy) {
            case 'price':
                queryBuilder.orderBy('product.price', sortOrder);
                break;
                case 'discount':
                    queryBuilder.addSelect('(product.price - COALESCE(product.newPrice, 0))', 'newPrice')
                        .orderBy('newPrice', sortOrder);
                break;
            case 'rating':
                queryBuilder.orderBy('product.AvgRating', sortOrder);
                break;
            default:
                    queryBuilder.orderBy('product.createdAt', sortOrder);
        }
        // تطبيق التقسيم (Pagination)
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);

        // تنفيذ الاستعلام
        const [products, total] = await queryBuilder.getManyAndCount();

        // تحسين شكل البيانات المرتجعة
        const result = products.map(product => ({
            ...product,
            images: product.resources?.map(res => res.filePath) || [], // تم التعديل هنا
            discount: product.newPrice ? 
                Math.round(((product.price - product.newPrice) / product.price) * 100) : 0
        }));

        res.json({
            success: true,
            data: result,
            pagination: {
                total,
                page: Number(page),
                totalPages: Math.ceil(total / limit),
                limit: Number(limit)
            }
        });

    } catch (error: any) {
        console.error("Error in searchProducts:", error);
        res.status(500).json({ 
            success: false,
            error: "Internal server error" 
        });
    }
};

// دالة الحصول على البراندات مع الفلترة
export const getBrandsWithFilters: RequestHandler = async (req, res): Promise<any> => {
    try {
        const { searchTerm, hasProducts } = req.query;

        const queryBuilder = Brand.createQueryBuilder('brand')
            .leftJoinAndSelect('brand.resources', 'resources')
            .leftJoin('brand.product', 'product');

        if (searchTerm) {
            queryBuilder.where({ name: Like(`%${searchTerm}%`) });
        }

        if (hasProducts === 'true') {
            queryBuilder.andWhere('product.productId IS NOT NULL');
        }

        const brands = await queryBuilder.getMany();

        res.json({
            success: true,
            data: brands.map(brand => ({
                id: brand.brandId,
                name: brand.name,
                image: brand.resources?.filePath || null, // تم التعديل هنا
                createdAt: brand.createdAt,
                updatedAt: brand.updatedAt
            }))
        });

    } catch (error: any) {
        console.error("Error in getBrandsWithFilters:", error);
        res.status(500).json({ 
            success: false,
            error: "Internal server error" 
        });
    }
};

// دالة الحصول على الفئات مع الفلترة
export const getCategoriesWithFilters: RequestHandler = async (req, res): Promise<any> => {
    try {
        const { searchTerm, isActive, hasProducts } = req.query;

        const queryBuilder = Category.createQueryBuilder('category')
            .leftJoin('category.product', 'product');

        if (searchTerm) {
            queryBuilder.where({ name: Like(`%${searchTerm}%`) });
        }

        if (isActive !== undefined) {
            queryBuilder.andWhere({ isActive: isActive === 'true' });
        }

        if (hasProducts === 'true') {
            queryBuilder.andWhere('product.productId IS NOT NULL');
        }

        const categories = await queryBuilder.getMany();

        res.json({
            success: true,
            data: categories.map(category => ({
                id: category.categoryId,
                name: category.name,
                isActive: category.isActive,
                createdAt: category.createdAt,
                updatedAt: category.updatedAt
            }))
        });

    } catch (error: any) {
        console.error("Error in getCategoriesWithFilters:", error);
        res.status(500).json({ 
            success: false,
            error: "Internal server error" 
        });
    }
};