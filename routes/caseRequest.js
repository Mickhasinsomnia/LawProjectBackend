const {addCaseRequest,cancelCaseRequest,updateCaseRequest,getCaseRequestById,getCaseRequestsByClientId,getCaseRequestsByLawyerId} = require('../controllers/caseRequest')

const {protect,authorize} = require('../middleware/auth')

const express = require('express');
const router = express.Router();

router.get('/client/:id', protect, authorize('user','admin'), getCaseRequestsByClientId);
router.get('/lawyer/:id', protect, authorize('lawyer','admin'), getCaseRequestsByLawyerId);

router.route('/').post(protect,authorize('user','admin'),addCaseRequest);

router.route('/:id').put(protect,authorize('user','admin'),updateCaseRequest).delete(protect,authorize('user','admin','lawyer'),cancelCaseRequest);

router.route('/:id').get(protect,getCaseRequestById);



module.exports = router;
