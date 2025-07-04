import express from 'express';
import { addCaseRequest, cancelCaseRequest, updateCaseRequest, getCaseRequestById, getCaseRequestsByClientId, getCaseRequestsByLawyerId, getAllCaseRequest,deleteFileFromCase,addFileToCase } from '../controllers/caseRequest.js';
import { protect, authorize } from '../middleware/auth.js';
import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = express.Router();

router.get('/client', protect, authorize('user','admin'), getCaseRequestsByClientId);
router.get('/lawyer', protect, authorize('lawyer','admin'), getCaseRequestsByLawyerId);

router.route('/').post(protect,authorize('user','admin'),upload.array('file', 5),addCaseRequest).get(protect,authorize('admin'),getAllCaseRequest);

router.route('/:id').put(protect,authorize('user','admin'),updateCaseRequest).delete(protect,authorize('user','admin','lawyer'),cancelCaseRequest);

router.route('/:id').get(protect, getCaseRequestById);
router.route('/:id/file').delete(protect,authorize('user','admin'),deleteFileFromCase).put(protect,authorize('user','admin'),upload.single('file'),addFileToCase);

export default router;
