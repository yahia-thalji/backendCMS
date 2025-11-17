import { Router } from 'express';
import {
  addSupplier,
  updateSupplier,
  deleteSupplier,
  getAllSuppliers,
  getSupplierById,
} from '../controller/supplierController';


const router = Router();

router.post('/add', addSupplier);
router.post('/update/:id', updateSupplier);
router.delete('/delete/:id', deleteSupplier);
router.get('/getAll', getAllSuppliers);
router.get('/getById/:id', getSupplierById);

export default router;