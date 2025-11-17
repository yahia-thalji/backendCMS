import { Router } from 'express';
import {
  getDashboardStats,
  getLowStockItems,
  getRecentInvoices,
  getActiveShipments,
} from '../controller/dashboardController';

const router = Router();

router.get('/stats', getDashboardStats);
router.get('/low-stock-items', getLowStockItems);
router.get('/recent-invoices', getRecentInvoices);
router.get('/active-shipments', getActiveShipments);

export default router;