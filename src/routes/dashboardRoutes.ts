import express from 'express';
import {
    getSystemStatistics,
    getSalesAnalysis,
    getTopSellingProducts,
    getUserAnalytics,
    getCourseAnalytics,
    getInventoryAnalysis,
    getRatingsAnalysis,
    getBrandAnalytics,
    getCategoryAnalytics,
    getRevenueAnalysis,
    getEnrollmentTrends,
    getCartAnalysis,
    getAssignmentAnalytics,
    getNotificationAnalytics,
    getUserActivity,
    getTopRatedProducts,
    getTopRatedCourses,
    getLowStockProducts,
    getSalesTrends,
    getNewCustomers,
    getRepeatCustomers,
    getAverageCartValue,
    getConversionRates,
    getMostViewedProducts,
    getPopularCategories,
    getPopularBrands,
    getSalesByRegion,
    getSalesByAgeGroup,
    getSalesByGender,
    getMostAddedToCart,
    getOrderCompletionRate,
    getAverageDeliveryTime,
    getRefundRate,
    getOrderSizeDistribution,
    getCustomerLTV
} from '../controller/dashboradController';

const router = express.Router();

// إحصائيات عامة
router.get('/system-stats', getSystemStatistics);
router.get('/sales-analysis', getSalesAnalysis);
router.get('/top-selling-products', getTopSellingProducts);
router.get('/user-analytics', getUserAnalytics);
router.get('/course-analytics', getCourseAnalytics);
router.get('/inventory-analysis', getInventoryAnalysis);
router.get('/ratings-analysis', getRatingsAnalysis);
router.get('/brand-analytics', getBrandAnalytics);
router.get('/category-analytics', getCategoryAnalytics);
router.get('/revenue-analysis', getRevenueAnalysis);
router.get('/enrollment-trends', getEnrollmentTrends);
router.get('/cart-analysis', getCartAnalysis);
router.get('/assignment-analytics', getAssignmentAnalytics);
router.get('/notification-analytics', getNotificationAnalytics);
router.get('/user-activity', getUserActivity);
router.get('/top-rated-products', getTopRatedProducts);
router.get('/top-rated-courses', getTopRatedCourses);
router.get('/low-stock-products', getLowStockProducts);
router.get('/sales-trends', getSalesTrends);
router.get('/new-customers', getNewCustomers);
router.get('/repeat-customers', getRepeatCustomers);
router.get('/average-cart-value', getAverageCartValue);
router.get('/conversion-rates', getConversionRates);
router.get('/most-viewed-products', getMostViewedProducts);
router.get('/popular-categories', getPopularCategories);
router.get('/popular-brands', getPopularBrands);
router.get('/sales-by-region', getSalesByRegion);
router.get('/sales-by-age-group', getSalesByAgeGroup);
router.get('/sales-by-gender', getSalesByGender);
router.get('/most-added-to-cart', getMostAddedToCart);
router.get('/order-completion-rate', getOrderCompletionRate);
router.get('/average-delivery-time', getAverageDeliveryTime);
router.get('/refund-rate', getRefundRate);
router.get('/order-size-distribution', getOrderSizeDistribution);
router.get('/customer-ltv', getCustomerLTV);

export default router;