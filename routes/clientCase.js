const {getCaseRequestsByClientId} = require('../controllers/caseRequest')

const express = require('express');
const router = express.Router();

router.route('/:id').get(getCaseRequestsByClientId);

module.exports = router;
