import { RequestHandler } from "express";
import { CartItem } from "../entities/cartItem";
import { Course } from "../entities/course";
import { Product } from "../entities/product";
import { User } from "../entities/user";
import { Between, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { Reviews } from "../entities/reviews";
import { Notification } from "../entities/notification";
import { Cart } from "../entities/cart";
import { Category } from "../entities/category";
import { Brand } from "../entities/brand";
import { Assignment } from "../entities/assignment";
import { Assignmentsubmition } from "../entities/assignmentSubmition";
import { Enrollments } from "../entities/enrollments";

// 1. إحصائيات عامة للنظام
export const getSystemStatistics: RequestHandler = async (req, res): Promise<any> => {
    try {
        const [
            totalUsers,
            totalProducts,
            totalCourses,
            totalSales,
            totalRevenueResult,
            activeCourses,
            outOfStockProducts
        ] = await Promise.all([
            User.count(),
            Product.count(),
            Course.count(),
            CartItem.count({ where: { status: 'accept' } }),
            CartItem.createQueryBuilder('cartItem')
                .select('SUM(cartItem.quantity)', 'sum')
                .where('cartItem.status = :status', { status: 'accept' })
                .getRawOne(),
            Course.count({ where: { status: 'open' } }),
            Product.count({ where: { status: 'out of stock' } })
        ]);

        const totalRevenue = parseFloat(totalRevenueResult?.sum || '0');

        res.json({
            totalUsers,
            totalProducts,
            totalCourses,
            totalSales,
            totalRevenue,
            activeCourses,
            outOfStockProducts
        });
    } catch (error: any) {
        console.log("Error in getSystemStatistics controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getSalesAnalysis: RequestHandler = async (req, res): Promise<any> => {
    try {
        const { startDate, endDate } = req.query;

        const sales = await CartItem.find({
            where: {
                status: 'accept',
                createdAt: Between(new Date(startDate as string), new Date(endDate as string))
            },
            relations: ['product']
        });

        const initialValue: Record<string, { count: number; revenue: number }> = {};

        const salesByDate = sales.reduce((acc: Record<string, { count: number; revenue: number }>, sale) => {
            const date = sale.createdAt.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = { count: 0, revenue: 0 };
            }
            acc[date].count += sale.quantity;
            acc[date].revenue += sale.quantity * (sale.product.newPrice || sale.product.price);
            return acc;
        }, initialValue);

        res.json(salesByDate);
    } catch (error: any) {
        console.log("Error in getSalesAnalysis controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

// 3. أفضل المنتجات مبيعاً
export const getTopSellingProducts: RequestHandler = async (req, res): Promise<any> => {
    try {
        const { limit = 10 } = req.query;

        const topProducts = await Product.createQueryBuilder('product')
            .leftJoin('product.cartItems', 'cartItem')
            .select(['product.productId', 'product.name', 'product.price', 'product.newPrice'])
            .addSelect('SUM(cartItem.quantity)', 'totalsold')
            .where('cartItem.status = :status', { status: 'accept' })
            .groupBy('product.productId')
            .orderBy('totalsold', 'DESC')
            .limit(Number(limit))
            .getRawMany();

        res.json(topProducts);
    } catch (error: any) {
        console.log("Error in getTopSellingProducts controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

// 4. تحليل المستخدمين
export const getUserAnalytics: RequestHandler = async (req, res): Promise<any> => {
    try {
        // Total user count
        const userCount = await User.count();

        // Users grouped by gender
        const usersByGender = await User.createQueryBuilder('user')
            .select('user.gender', 'gender')
            .addSelect('COUNT(*)', 'count')
            .groupBy('user.gender')
            .getRawMany();

        // Count of active users (users with accepted cart items)
        const activeUsers = await CartItem.createQueryBuilder('cartItem')
            .select('COUNT(DISTINCT cartItem.user)', 'count')  // Changed from userId to user
            .where('cartItem.status = :status', { status: 'accept' })
            .getRawOne();

        res.json({
            totalUsers: userCount,
            usersByGender,
            activeUsers: activeUsers?.count || 0
        });
    } catch (error: any) {
        console.log("Error in getUserAnalytics controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}
// 5. تحليل الدورات التعليمية
export const getCourseAnalytics: RequestHandler = async (req, res): Promise<any> => {
    try {
        const totalCourses = await Course.count();
        const activeCourses = await Course.count({ where: { status: 'open' } });
        const enrollments = await Enrollments.count({ where: { status: 'accept' } });

        const topCourses = await Course.createQueryBuilder('course')
            .leftJoin('course.enrollments', 'enrollment')
            .select(['course.courseId', 'course.courseTitle', 'course.price'])
            .addSelect('COUNT(enrollment.myCourseId)', 'enrollmentcount')
            .where('enrollment.status = :status', { status: 'accept' })
            .groupBy('course.courseId')
            .orderBy('enrollmentcount', 'DESC')
            .limit(5)
            .getRawMany();

        res.json({
            totalCourses,
            activeCourses,
            totalEnrollments: enrollments,
            topCourses
        });
    } catch (error: any) {
        console.log("Error in getCourseAnalytics controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

// 6. تحليل المخزون
export const getInventoryAnalysis: RequestHandler = async (req, res): Promise<any> => {
    try {
        const totalProducts = await Product.count();
        const outOfStock = await Product.count({ where: { status: 'out of stock' } });
        const runningLow = await Product.count({ where: { status: 'running low' } });

        const inventoryStatus = await Product.createQueryBuilder()
            .select('status, COUNT(*) as count')
            .groupBy('status')
            .getRawMany();

        res.json({
            totalProducts,
            outOfStock,
            runningLow,
            inventoryStatus
        });
    } catch (error: any) {
        console.log("Error in getInventoryAnalysis controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

// 7. تحليل التقييمات
export const getRatingsAnalysis: RequestHandler = async (req, res): Promise<any> => {
    try {
        const productReviews = await Reviews.createQueryBuilder('review')
            .leftJoin('review.product', 'product')
            .select(['product.productId', 'product.name'])
            .addSelect('AVG(review.rating)', 'avgrating')
            .groupBy('product.productId')
            .getRawMany();

        const courseReviews = await Reviews.createQueryBuilder('review')
            .leftJoin('review.course', 'course')
            .select(['course.courseId', 'course.courseTitle'])
            .addSelect('AVG(review.rating)', 'avgrating')
            .groupBy('course.courseId')
            .getRawMany();

        res.json({
            productReviews,
            courseReviews
        });
    } catch (error: any) {
        console.log("Error in getRatingsAnalysis controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

// 8. تحليل العلامات التجارية
export const getBrandAnalytics: RequestHandler = async (req, res): Promise<any> => {
    try {
        const brands = await Brand.createQueryBuilder('brand')
            .leftJoin('brand.product', 'product')
            .leftJoin('product.cartItems', 'cartItem')
            .select(['brand.brandId', 'brand.name'])
            .addSelect('COUNT(DISTINCT product.productId)', 'productCount')
            .addSelect('SUM(cartItem.quantity)', 'totalSold')
            .where('cartItem.status = :status', { status: 'accept' })
            .groupBy('brand.brandId')
            .getRawMany();

        res.json(brands);
    } catch (error: any) {
        console.log("Error in getBrandAnalytics controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

// 9. تحليل الفئات
export const getCategoryAnalytics: RequestHandler = async (req, res): Promise<any> => {
    try {
        const categories = await Category.createQueryBuilder('category')
            .leftJoin('category.product', 'product')
            .leftJoin('product.cartItems', 'cartItem')
            .select(['category.categoryId', 'category.name'])
            .addSelect('COUNT(DISTINCT product.productId)', 'productCount')
            .addSelect('SUM(cartItem.quantity)', 'totalSold')
            .where('cartItem.status = :status', { status: 'accept' })
            .groupBy('category.categoryId')
            .getRawMany();

        res.json(categories);
    } catch (error: any) {
        console.log("Error in getCategoryAnalytics controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

// 10. تحليل الإيرادات
export const getRevenueAnalysis: RequestHandler = async (req, res): Promise<any> => {
    try {
        const { period = 'month' } = req.query;

        let groupBy = '';
        let dateFormat = '';
        
        if (period === 'day') {
            groupBy = 'DATE(cartItem.createdAt)';
            dateFormat = 'YYYY-MM-DD';
        } else if (period === 'month') {
            groupBy = 'TO_CHAR(cartItem.createdAt, \'YYYY-MM\')';
            dateFormat = 'YYYY-MM';
        } else if (period === 'year') {
            groupBy = 'EXTRACT(YEAR FROM cartItem.createdAt)';
            dateFormat = 'YYYY';
        }

        // For product revenue
        const productRevenue = await CartItem.createQueryBuilder('cartItem')
            .leftJoin('cartItem.product', 'product')
            .select(`${groupBy} as period`)
            .addSelect('SUM(cartItem.quantity * COALESCE(product.newPrice, product.price))', 'revenue')
            .where('cartItem.status = :status', { status: 'accept' })
            .groupBy('period')
            .orderBy('period')
            .getRawMany();

        // For course revenue
        const courseRevenue = await Enrollments.createQueryBuilder('enrollment')
            .select(`TO_CHAR(enrollment.createdAt, '${dateFormat}') as period`)
            .addSelect('SUM(course.price)', 'revenue')
            .leftJoin('enrollment.course', 'course')
            .where('enrollment.status = :status', { status: 'accept' })
            .groupBy('period')
            .orderBy('period')
            .getRawMany();

        res.json({
            productRevenue,
            courseRevenue
        });
    } catch (error: any) {
        console.log("Error in getRevenueAnalysis controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}
// 11. تحليل التسجيلات في الدورات
export const getEnrollmentTrends: RequestHandler = async (req, res): Promise<any> => {
    try {
        const enrollments = await Enrollments.createQueryBuilder('enrollment')
            .select('DATE(enrollment.createdAt) as date, COUNT(*) as count')
            .where('status = :status', { status: 'accept' })
            .groupBy('date')
            .orderBy('date')
            .getRawMany();

        res.json(enrollments);
    } catch (error: any) {
        console.log("Error in getEnrollmentTrends controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

// 12. تحليل سلة التسوق
export const getCartAnalysis: RequestHandler = async (req, res): Promise<any> => {
    try {
        // Count abandoned carts (inCart status and not updated in last day)
        const abandonedCarts = await Cart.createQueryBuilder('cart')
            .leftJoin('cart.items', 'item')
            .select('COUNT(DISTINCT cart.cartId)', 'count')
            .where('item.status = :status', { status: 'inCart' })
            .andWhere('cart.updatedAt < NOW() - INTERVAL \'1 day\'')
            .getRawOne();

        // Calculate conversion rate (accepted carts vs total carts)
        const conversionRate = await CartItem.createQueryBuilder('item')
            .select([
                'COUNT(DISTINCT CASE WHEN item.status = \'accept\' THEN item.cart END) as accepted',
                'COUNT(DISTINCT item.cart) as total'
            ])
            .getRawOne();

        const rate = conversionRate.total > 0 
            ? (conversionRate.accepted / conversionRate.total) * 100 
            : 0;

        res.json({
            abandonedCarts: abandonedCarts.count,
            conversionRate: rate
        });
    } catch (error: any) {
        console.log("Error in getCartAnalysis controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

// 13. تحليل الواجبات والتسليمات
export const getAssignmentAnalytics: RequestHandler = async (req, res): Promise<any> => {
    try {
        const assignments = await Assignment.count();
        const submissions = await Assignmentsubmition.count();

        const submissionStatus = await Assignmentsubmition.createQueryBuilder()
            .select('status, COUNT(*) as count')
            .groupBy('status')
            .getRawMany();

        res.json({
            totalAssignments: assignments,
            totalSubmissions: submissions,
            submissionStatus
        });
    } catch (error: any) {
        console.log("Error in getAssignmentAnalytics controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

// 14. تحليل الإشعارات
export const getNotificationAnalytics: RequestHandler = async (req, res): Promise<any> => {
    try {
        const totalNotifications = await Notification.count();
        const readNotifications = await Notification.count({ where: { read: true } });
        const unreadNotifications = await Notification.count({ where: { read: false } });

        const notificationsByType = await Notification.createQueryBuilder()
            .select('type, COUNT(*) as count')
            .groupBy('type')
            .getRawMany();

        res.json({
            totalNotifications,
            readNotifications,
            unreadNotifications,
            notificationsByType
        });
    } catch (error: any) {
        console.log("Error in getNotificationAnalytics controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

// 15. تحليل نشاط المستخدمين
export const getUserActivity: RequestHandler = async (req, res): Promise<any> => {
    try {
        // Get active users count (users with cart activity in last 7 days)
        const activeUsers = await CartItem.createQueryBuilder('cartItem')
            .select('COUNT(DISTINCT cartItem.user)', 'count')
            .where('cartItem.createdAt > CURRENT_DATE - INTERVAL \'7 days\'')
            .getRawOne();

        // Get new users count (registered in last 7 days)
        const newUsers = await User.createQueryBuilder('user')
            .select('COUNT(user.UserID)', 'count')
            .where('user.createdAt > CURRENT_DATE - INTERVAL \'7 days\'')
            .getRawOne();

        // Get top active users with purchase and enrollment counts
        const userActivity = await User.createQueryBuilder('user')
            .leftJoin('user.cartItems', 'cartItem')
            .leftJoin('user.enrollments', 'enrollment')
            .select([
                'user.UserID as "userId"',
                'user.firstName as "firstName"',
                'user.lastName as "lastName"',
                `COUNT(DISTINCT CASE WHEN cartItem.status = 'accept' AND cartItem.createdAt > CURRENT_DATE - INTERVAL '7 days' THEN cartItem.id END) as purchases`,
                `COUNT(DISTINCT CASE WHEN enrollment.status = 'accept' THEN enrollment.myCourseId END) as enrollments`
            ])
            .groupBy('user.UserID, user.firstName, user.lastName')
            .orderBy('purchases', 'DESC')
            .limit(10)
            .getRawMany();

        res.json({
            activeUsers: parseInt(activeUsers?.count || '0', 10),
            newUsers: parseInt(newUsers?.count || '0', 10),
            topActiveUsers: userActivity
        });
    } catch (error: any) {
        console.error("Error in getUserActivity controller", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// 16. تحليل المنتجات الأكثر تقييماً
export const getTopRatedProducts: RequestHandler = async (req, res): Promise<any> => {
    try {
        const topProducts = await Product.createQueryBuilder('product')
            .leftJoin('product.review', 'review')
            .select(['product.productId', 'product.name'])
            .addSelect('AVG(review.rating)', 'avgrating')
            .addSelect('COUNT(review.reviewID)', 'reviewCount')
            .groupBy('product.productId')
            .having('COUNT(review.reviewID) > 0')
            .orderBy('avgrating', 'DESC')
            .limit(10)
            .getRawMany();

        res.json(topProducts);
    } catch (error: any) {
        console.log("Error in getTopRatedProducts controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

// 17. تحليل الدورات الأكثر تقييماً
export const getTopRatedCourses: RequestHandler = async (req, res): Promise<any> => {
    try {
        const topCourses = await Course.createQueryBuilder('course')
            .leftJoin('course.review', 'review')
            .select(['course.courseId', 'course.courseTitle'])
            .addSelect('AVG(review.rating)', 'avgrating')
            .addSelect('COUNT(review.reviewID)', 'reviewCount')
            .groupBy('course.courseId')
            .having('COUNT(review.reviewID) > 0')
            .orderBy('avgrating', 'DESC')
            .limit(10)
            .getRawMany();

        res.json(topCourses);
    } catch (error: any) {
        console.log("Error in getTopRatedCourses controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

// 18. تحليل المنتجات قليلة المخزون
export const getLowStockProducts: RequestHandler = async (req, res): Promise<any> => {
    try {
        const lowStockProducts = await Product.find({
            where: [
                { status: 'running low' },
                { status: 'out of stock' }
            ],
            order: { quantity: 'ASC' },
            take: 20
        });

        res.json(lowStockProducts);
    } catch (error: any) {
        console.log("Error in getLowStockProducts controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

// 19. تحليل اتجاهات المبيعات
export const getSalesTrends: RequestHandler = async (req, res): Promise<any> => {
    try {
        const { days = 30 } = req.query;
        const daysNum = parseInt(days as string);

        const salesTrends = await CartItem.createQueryBuilder('cartItem')
            .leftJoin('cartItem.product', 'product')
            .select('DATE(cartItem.createdAt) as date')
            .addSelect('SUM(cartItem.quantity)', 'totalQuantity')
            .addSelect('SUM(cartItem.quantity * CASE WHEN product.newPrice IS NOT NULL THEN product.newPrice ELSE product.price END)', 'totalRevenue')
            .where('cartItem.status = :status', { status: 'accept' })
            .andWhere('cartItem.createdAt > CURRENT_DATE - :daysNum * INTERVAL \'1 day\'', { daysNum })
            .groupBy('date')
            .orderBy('date')
            .getRawMany();

        res.json(salesTrends);
    } catch (error: any) {
        console.log("Error in getSalesTrends controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

// 20. تحليل العملاء الجدد
export const getNewCustomers: RequestHandler = async (req, res): Promise<any> => {
    try {
        const { days = 30 } = req.query;
        const daysNum = Number(days);

        // Calculate the date X days ago
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysNum);

        const newCustomers = await User.createQueryBuilder('user')
            .where('user.createdAt > :startDate', { startDate })
            .orderBy('user.createdAt', 'DESC')
            .getMany();

        res.json(newCustomers);
    } catch (error: any) {
        console.log("Error in getNewCustomers controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

// 21. تحليل العملاء المتكررين
export const getRepeatCustomers: RequestHandler = async (req, res): Promise<any> => {
    try {
        const repeatCustomers = await CartItem.createQueryBuilder('cartItem')
            .innerJoin('cartItem.user', 'user')
            .select('user.firstName', 'firstName')
            .addSelect('user.lastName', 'lastName')
            .addSelect('user.phoneNumber', 'phoneNumber')
            .addSelect('COUNT(*)', 'purchaseCount')
            .where('cartItem.status = :status', { status: 'accept' })
            .groupBy('user.firstName')
            .addGroupBy('user.lastName')
            .addGroupBy('user.phoneNumber')
            .having('COUNT(*) > 1')
            .getRawMany();

        res.json(repeatCustomers);
    } catch (error: any) {
        console.log("Error in getRepeatCustomers controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}


// 22. تحليل متوسط سعر السلة
export const getAverageCartValue: RequestHandler = async (req, res): Promise<any> => {
    try {
        const result = await Cart.createQueryBuilder('cart')
            .select('AVG(cart.orderTotalPrice)', 'averageValue')
            .getRawOne();

        res.json({ averageCartValue: result.averageValue });
    } catch (error: any) {
        console.log("Error in getAverageCartValue controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

// 23. تحليل معدل التحويل
export const getConversionRates: RequestHandler = async (req, res): Promise<any> => {
    try {
        const viewsToCart = 0; // تحتاج إلى بيانات المشاهدات
        const cartToPurchase = await CartItem.createQueryBuilder('item')
        .innerJoin('item.cart', 'cart')
        .select(
            `COUNT(DISTINCT CASE WHEN item.status = 'accept' THEN cart.cartId END) * 1.0 / COUNT(DISTINCT cart.cartId) * 100`,
            'rate'
        )
        .getRawOne();
    

        res.json({
            viewsToCartRate: viewsToCart,
            cartToPurchaseRate: cartToPurchase.rate
        });
    } catch (error: any) {
        console.log("Error in getConversionRates controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

// 24. تحليل المنتجات الأكثر مشاهدة
export const getMostViewedProducts: RequestHandler = async (req, res): Promise<any> => {
    try {
        // تحتاج إلى إضافة نظام تتبع المشاهدات
        res.json({ message: "سيتم تطوير هذه الوظيفة لاحقاً" });
    } catch (error: any) {
        console.log("Error in getMostViewedProducts controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

// 25. تحليل الفئات الأكثر شعبية
export const getPopularCategories: RequestHandler = async (req, res): Promise<any> => {
    try {
        const popularCategories = await Category.createQueryBuilder('category')
            .leftJoin('category.product', 'product')
            .leftJoin('product.cartItems', 'cartItem')
            .select(['category.categoryId', 'category.name'])
            .addSelect('COUNT(DISTINCT cartItem.id)', 'salescount')
            .where('cartItem.status = :status', { status: 'accept' })
            .groupBy('category.categoryId')
            .orderBy('salescount', 'DESC')
            .limit(5)
            .getRawMany();

        res.json(popularCategories);
    } catch (error: any) {
        console.log("Error in getPopularCategories controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

// 26. تحليل العلامات التجارية الأكثر شعبية
export const getPopularBrands: RequestHandler = async (req, res): Promise<any> => {
    try {
        const popularBrands = await Brand.createQueryBuilder('brand')
            .leftJoin('brand.product', 'product')
            .leftJoin('product.cartItems', 'cartItem')
            .select(['brand.brandId', 'brand.name'])
            .addSelect('COUNT(DISTINCT cartItem.id)', 'salescount')
            .where('cartItem.status = :status', { status: 'accept' })
            .groupBy('brand.brandId')
            .orderBy('salescount', 'DESC')
            .limit(5)
            .getRawMany();

        res.json(popularBrands);
    } catch (error: any) {
        console.log("Error in getPopularBrands controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

// 27. تحليل المبيعات حسب المنطقة
export const getSalesByRegion: RequestHandler = async (req, res): Promise<any> => {
    try {
        const salesByRegion = await User.createQueryBuilder('user')
            .leftJoin('user.cartItems', 'cartItem')
            .select(['user.address', 'COUNT(cartItem.id) as salesCount'])
            .where('cartItem.status = :status', { status: 'accept' })
            .groupBy('user.address')
            .getRawMany();

        res.json(salesByRegion);
    } catch (error: any) {
        console.log("Error in getSalesByRegion controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

// 28. تحليل المبيعات حسب الفئة العمرية
export const getSalesByAgeGroup: RequestHandler = async (req, res): Promise<any> => {
    try {
        const salesByAge = await User.createQueryBuilder('user')
            .leftJoin('user.cartItems', 'cartItem')
            .select([
                `CASE 
                    WHEN EXTRACT(YEAR FROM AGE(user.dateOfBirth)) BETWEEN 13 AND 19 THEN '13-19' 
                    WHEN EXTRACT(YEAR FROM AGE(user.dateOfBirth)) BETWEEN 20 AND 29 THEN '20-29' 
                    WHEN EXTRACT(YEAR FROM AGE(user.dateOfBirth)) BETWEEN 30 AND 39 THEN '30-39' 
                    WHEN EXTRACT(YEAR FROM AGE(user.dateOfBirth)) BETWEEN 40 AND 49 THEN '40-49' 
                    ELSE '50+' 
                 END as "ageGroup"`,
                'COUNT(cartItem.id) as "salesCount"'
            ])
            .where('cartItem.status = :status', { status: 'accept' })
            .groupBy(`CASE 
                    WHEN EXTRACT(YEAR FROM AGE(user.dateOfBirth)) BETWEEN 13 AND 19 THEN '13-19' 
                    WHEN EXTRACT(YEAR FROM AGE(user.dateOfBirth)) BETWEEN 20 AND 29 THEN '20-29' 
                    WHEN EXTRACT(YEAR FROM AGE(user.dateOfBirth)) BETWEEN 30 AND 39 THEN '30-39' 
                    WHEN EXTRACT(YEAR FROM AGE(user.dateOfBirth)) BETWEEN 40 AND 49 THEN '40-49' 
                    ELSE '50+' 
                END`)
            .getRawMany();

        res.json(salesByAge);
    } catch (error: any) {
        console.log("Error in getSalesByAgeGroup controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};


// 29. تحليل المبيعات حسب الجنس
export const getSalesByGender: RequestHandler = async (req, res): Promise<any> => {
    try {
        const salesByGender = await User.createQueryBuilder('user')
            .leftJoin('user.cartItems', 'cartItem')
            .select(['user.gender', 'COUNT(cartItem.id) as salesCount'])
            .where('cartItem.status = :status', { status: 'accept' })
            .groupBy('user.gender')
            .getRawMany();

        res.json(salesByGender);
    } catch (error: any) {
        console.log("Error in getSalesByGender controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

// 30. تحليل المنتجات الأكثر إضافة إلى السلة
export const getMostAddedToCart: RequestHandler = async (req, res): Promise<any> => {
    try {
        const mostAdded = await Product.createQueryBuilder('product')
            .leftJoin('product.cartItems', 'cartItem')
            .select('product.productId', 'productId')
            .addSelect('product.name', 'name')
            .addSelect('COUNT(cartItem.id)', 'cartAdds')
            .groupBy('product.productId')
            .addGroupBy('product.name')
            .orderBy('"cartAdds"', 'DESC')
            .limit(10)
            .getRawMany();

        // تحويل القيم العددية من string إلى number
        const formatted = mostAdded.map(item => ({
            productId: Number(item.productId),
            name: item.name,
            cartAdds: Number(item.cartAdds)
        }));

        res.json(formatted);
    } catch (error: any) {
        console.log("Error in getMostAddedToCart controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};



// 31. تحليل معدل إتمام الطلب
export const getOrderCompletionRate: RequestHandler = async (req, res): Promise<any> => {
    try {
        // Count each status case
        const inCartCount = await CartItem.count({ where: { status: 'inCart' } });
        const pendingCount = await CartItem.count({ where: { status: 'pending' } });
        const completedCount = await CartItem.count({ where: { status: 'accept' } });
        const rejectedCount = await CartItem.count({ where: { status: 'rejected' } });

        // Return the counts in the requested format
        res.status(200).json({
            incart: inCartCount,
            pending: pendingCount,
            completed: completedCount,
            rejected: rejectedCount
        });

    } catch (error: any) {
        console.log("Error in getOrderCompletionRate controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// 32. تحليل متوسط وقت التسليم
export const getAverageDeliveryTime: RequestHandler = async (req, res): Promise<any> => {
    try {
        const result = await CartItem.createQueryBuilder('item')
            .select('AVG(EXTRACT(EPOCH FROM (item.deliveredAt - item.createdAt))/3600)', 'averageDeliveryHours')
            .where('item.status = :status', { status: 'accept' })
            .andWhere('item.deliveredAt IS NOT NULL')
            .getRawOne();

        const breakdown = await CartItem.createQueryBuilder('item')
            .leftJoin('item.user', 'user')
            .select('user.address', 'region')
            .addSelect('AVG(EXTRACT(EPOCH FROM (item.deliveredAt - item.createdAt))/3600)', 'averageHours')
            .where('item.status = :status', { status: 'accept' })
            .andWhere('item.deliveredAt IS NOT NULL')
            .groupBy('user.address')
            .getRawMany();

        res.json({
            averageDeliveryHours: parseFloat(result.averageDeliveryHours),
            breakdown: breakdown.map(item => ({
                region: item.region,
                averageHours: parseFloat(item.averageHours)
            }))
        });
    } catch (error: any) {
        console.log("Error in getAverageDeliveryTime controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};


// 33. تحليل معدل استرداد الأموال
export const getRefundRate: RequestHandler = async (req, res): Promise<any> => {
    try {
        const now = new Date();
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);

        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(now.getMonth() - 3);

        // المعدل الكلي
        const total = await CartItem.createQueryBuilder('item')
            .select('COUNT(DISTINCT CASE WHEN item.status = \'rejected\' THEN item.id END) * 100.0 / NULLIF(COUNT(DISTINCT item.id), 0)', 'rate')
            .getRawOne();

        // المعدل خلال الشهر الماضي
        const lastMonth = await CartItem.createQueryBuilder('item')
            .select('COUNT(DISTINCT CASE WHEN item.status = \'rejected\' THEN item.id END) * 100.0 / NULLIF(COUNT(DISTINCT item.id), 0)', 'rate')
            .where('item.createdAt >= :date', { date: oneMonthAgo.toISOString() })
            .getRawOne();

        // المعدل خلال الربع الأخير
        const lastQuarter = await CartItem.createQueryBuilder('item')
            .select('COUNT(DISTINCT CASE WHEN item.status = \'rejected\' THEN item.id END) * 100.0 / NULLIF(COUNT(DISTINCT item.id), 0)', 'rate')
            .where('item.createdAt >= :date', { date: threeMonthsAgo.toISOString() })
            .getRawOne();

        res.json({
            refundRate: parseFloat(total.rate) || 0,
            trend: {
                lastMonth: parseFloat(lastMonth.rate) || 0,
                lastQuarter: parseFloat(lastQuarter.rate) || 0
            }
        });
    } catch (error: any) {
        console.log("Error in getRefundRate controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};



// 34. تحليل توزيع الطلبات حسب الحجم
export const getOrderSizeDistribution: RequestHandler = async (req, res): Promise<any> => {
    try {
        const distribution = await CartItem.createQueryBuilder('item')
            .select('COUNT(*) as count, quantity')
            .where('status = :status', { status: 'accept' })
            .groupBy('quantity')
            .orderBy('quantity')
            .getRawMany();

        res.json(distribution);
    } catch (error: any) {
        console.log("Error in getOrderSizeDistribution controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

// 35. تحليل القيمة الدائمة للعميل (LTV)
export const getCustomerLTV: RequestHandler = async (req, res): Promise<any> => {
    try {
        const ltv = await CartItem.createQueryBuilder('item')
            .leftJoin('item.product', 'product')
            .leftJoin('item.user', 'user')
            .leftJoin('item.cart', 'cart')
            .select('user.firstName', 'firstName')
            .addSelect('user.lastName', 'lastName')
            .addSelect('SUM(item.quantity * COALESCE(product.newPrice, product.price))', 'totalValue')
            .addSelect('COUNT(DISTINCT cart.cartId)', 'orderCount')
            .where('item.status = :status', { status: 'accept' })
            .groupBy('user.firstName')
            .addGroupBy('user.lastName')
            .orderBy('SUM(item.quantity * COALESCE(product.newPrice, product.price))', 'DESC')
            .limit(10)
            .getRawMany();

        const formatted = ltv.map(item => ({
            firstName: item.firstName,
            lastName: item.lastName,
            totalValue: parseFloat(item.totalValue),
            orderCount: parseInt(item.orderCount)
        }));

        res.json(formatted);
    } catch (error: any) {
        console.log("Error in getCustomerLTV controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};





