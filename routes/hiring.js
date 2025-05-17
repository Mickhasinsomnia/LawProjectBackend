const {addHiring,updateHiring,cancelHiring} = require('../controllers/hiring')

const express = require('express');
const router = express.Router();

router.route('/').post(addHiring);

router.route('/:id').put(updateHiring).delete(cancelHiring);

module.exports = router;
