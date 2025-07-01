import express from 'express';
import { addCaseRequest, cancelCaseRequest, updateCaseRequest, getCaseRequestById, getCaseRequestsByClientId, getCaseRequestsByLawyerId, getAllCaseRequest } from '../controllers/caseRequest.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/client/:id', protect, authorize('user','admin'), getCaseRequestsByClientId);
router.get('/lawyer/:id', protect, authorize('lawyer','admin'), getCaseRequestsByLawyerId);

router.route('/').post(protect,authorize('user','admin'),addCaseRequest).get(protect,getAllCaseRequest);

router.route('/:id').put(protect,authorize('user','admin'),updateCaseRequest).delete(protect,authorize('user','admin','lawyer'),cancelCaseRequest);

router.route('/:id').get(protect,getCaseRequestById);

export default router;
