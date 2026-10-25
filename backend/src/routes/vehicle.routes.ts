import { Router } from 'express';
import * as vehicleController from '../controllers/vehicle.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate); // every vehicle route needs login

router.get('/', vehicleController.list);
router.get('/search', vehicleController.search);
router.post('/', requireAdmin, vehicleController.create);
router.put('/:id', requireAdmin, vehicleController.update);
router.delete('/:id', requireAdmin, vehicleController.remove);
router.post('/:id/purchase', vehicleController.purchase);
router.post('/:id/restock', requireAdmin, vehicleController.restock);

export default router;