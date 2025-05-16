const {createActivity,updateActivity,deleteActivity} = require('../controllers/appointment')

const express = require('express');

const router = express.Router();

router.route('/').post(createActivity)

router.route('/:id').put(updateActivity).delete(deleteActivity);

module.exports = router;
