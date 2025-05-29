const { createWorkingDay,updateWorkingDay } = require('../controllers/workingDay');

const { protect, authorize } = require('../middleware/auth');

const express = require('express');

const router = express.Router();

router.route('/').post(protect,authorize('lawyer'),createWorkingDay).put(protect,authorize('lawyer'),updateWorkingDay);

module.exports = router;
