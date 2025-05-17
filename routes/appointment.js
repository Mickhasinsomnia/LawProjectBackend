const {createAppointment,updateAppointment,deleteAppointment} = require('../controllers/appointment')

const express = require('express');

const router = express.Router();

router.route('/').post(createAppointment)

router.route('/:id').put(updateAppointment).delete(deleteAppointment);

module.exports = router;
