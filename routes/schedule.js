const express=require('express')

const {addSchedule} = require('../controllers/schedule')

const router = express.Router();

router.route('/').post(addSchedule);

module.exports = router;
