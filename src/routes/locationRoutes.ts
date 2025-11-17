


import { Router } from 'express';
import {
  addLocation,
  updateLocation,
  deleteLocation,
  getAllLocations,
  getLocationById,
} from '../controller/locationController';

const router = Router();

router.post('/add', addLocation);
router.post('/update/:id', updateLocation);
router.delete('/delete/:id', deleteLocation);
router.get('/getAll', getAllLocations);
router.get('/getById/:id', getLocationById);

export default router;