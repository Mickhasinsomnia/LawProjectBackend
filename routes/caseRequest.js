const {addCaseRequest,cancelCaseRequest,updateCaseRequest,getCaseRequestById,getCaseRequestsByClientId,getCaseRequestsByLawyerId,getAllCaseRequest} = require('../controllers/caseRequest')

const {protect,authorize} = require('../middleware/auth')

const express = require('express');
const router = express.Router();

router.get('/client/:id', protect, authorize('user','admin'), getCaseRequestsByClientId);
router.get('/lawyer/:id', protect, authorize('lawyer','admin'), getCaseRequestsByLawyerId);

router.route('/').post(protect,authorize('user','admin'),addCaseRequest).get(protect,getAllCaseRequest);

router.route('/:id').put(protect,authorize('user','admin'),updateCaseRequest).delete(protect,authorize('user','admin','lawyer'),cancelCaseRequest);

router.route('/:id').get(protect,getCaseRequestById);



module.exports = router;
