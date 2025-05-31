const {createAppointment,updateAppointment,deleteAppointment,getAppointments} = require('../controllers/appointment')

const express = require('express');

const router = express.Router();

const {protect,authorize} = require('../middleware/auth')

router.post('/create/:id', protect, authorize('lawyer','user','admin'), createAppointment);

router.route('/:id').put(updateAppointment).delete(deleteAppointment);

router.get('/user/:id', protect, authorize('lawyer', 'user', 'admin'), getAppointments);
module.exports = router;
