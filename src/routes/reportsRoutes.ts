import { Router } from 'express';
import {
  getInventoryReport,
  getSuppliersReport,
  getCostsReport,
  getShippingReport,
  exportReport
} from '../controller/reportsController';

const router = Router();

router.get('/inventory', getInventoryReport);
router.get('/suppliers', getSuppliersReport);
router.get('/costs', getCostsReport);
router.get('/shipping', getShippingReport);
router.post('/export', exportReport);

export default router;