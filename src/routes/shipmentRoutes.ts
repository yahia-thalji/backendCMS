import { Router } from 'express';
import {
  addShipment,
  updateShipment,
  deleteShipment,
  getAllShipments,
  getShipmentById,
} from '../controller/shipmentController';

const router = Router();

router.post('/add', addShipment);
router.post('/update/:id', updateShipment);
router.delete('/delete/:id', deleteShipment);
router.get('/getAll', getAllShipments);
router.get('/getById/:id', getShipmentById);

export default router;