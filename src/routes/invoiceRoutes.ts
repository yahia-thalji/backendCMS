import { Router } from 'express';
import {
  addInvoice,
  updateInvoice,
  deleteInvoice,
  getAllInvoices,
  getInvoiceById,
} from '../controller/invoiceController';

const router = Router();

router.post('/add', addInvoice);
router.post('/update/:id', updateInvoice);
router.delete('/delete/:id', deleteInvoice);
router.get('/getAll', getAllInvoices);
router.get('/getById/:id', getInvoiceById);

export default router;