import { Router } from 'express';

import {
  addItem,
  updateItem,
    deleteItem,
    getAllItems,
    getItemById,
} from '../controller/itemController';

const router = Router();

router.post('/add', addItem);
router.post('/update/:id', updateItem);
router.delete('/delete/:id', deleteItem);
router.get('/getAll', getAllItems);
router.get('/getById/:id', getItemById);

export default router;