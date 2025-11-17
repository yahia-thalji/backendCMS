import { Router } from 'express';
import { addInternalTransfer, deleteInternalTransfer, getAllInternalTransfers, getInternalTransferById, updateInternalTransfer } from '../controller/internalTransferController';


const router = Router();

router.post('/add', addInternalTransfer);
router.post('/update/:id', updateInternalTransfer);
router.delete('/delete/:id', deleteInternalTransfer);
router.get('/getAll', getAllInternalTransfers);
router.get('/getById/:id', getInternalTransferById);

export default router;