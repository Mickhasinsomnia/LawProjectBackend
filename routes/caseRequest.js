const {addCaseRequest,cancelCaseRequest,updateCaseRequest,getCaseRequestById} = require('../controllers/caseRequest')

const express = require('express');
const router = express.Router();

router.route('/').post(addCaseRequest);

router.route('/:id').put(updateCaseRequest).delete(cancelCaseRequest);

router.route('/:id').get(getCaseRequestById);

module.exports = router;
