import { Router } from 'express';
import {
  addCurrency,
  updateCurrency,
  deleteCurrency,
  getAllCurrencies,
  getCurrencyById,
} from '../controller/currencyController';

const router = Router();

router.post('/add', addCurrency);
router.post('/update/:id', updateCurrency);
router.delete('/delete/:id', deleteCurrency);
router.get('/getAll', getAllCurrencies);
router.get('/getById/:id', getCurrencyById);

export default router;