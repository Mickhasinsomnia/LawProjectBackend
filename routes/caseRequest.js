const {addCaseRequest,cancelCaseRequest,updateCaseRequest,getCaseRequestById} = require('../controllers/caseRequest')

const {protect,authorize} = require('../middleware/auth')

const express = require('express');
const router = express.Router();

router.route('/').post(protect,addCaseRequest);

router.route('/:id').put(updateCaseRequest).delete(cancelCaseRequest);

router.route('/:id').get(protect,authorize('user'),getCaseRequestById);

module.exports = router;
