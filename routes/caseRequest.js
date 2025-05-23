const {addCaseRequest,cancelCaseRequest,updateCaseRequest,getCaseRequestById} = require('../controllers/caseRequest')

const {protect,authorize} = require('../middleware/auth')

const express = require('express');
const router = express.Router();

router.route('/').post(protect,authorize('user'),addCaseRequest);

router.route('/:id').put(protect,authorize('user'),updateCaseRequest).delete(protect,authorize('user'),cancelCaseRequest);

router.route('/:id').get(protect,getCaseRequestById);

module.exports = router;
