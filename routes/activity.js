const {createActivity,updateActivity} = require('../controllers/activity')

const express = require('express');

const router = express.Router();

router.route('/').post(createActivity)

router.route('/:id').put(updateActivity);

module.exports = router;
