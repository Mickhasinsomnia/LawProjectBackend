const {createAppointment,updateAppointment,deleteAppointment} = require('../controllers/appointment')

const express = require('express');

const router = express.Router();

const {protect,authorize} = require('../middleware/auth')

router.post('/create/:id', protect, authorize('lawyer'), createAppointment);

router.route('/:id').put(updateAppointment).delete(deleteAppointment);

module.exports = router;
