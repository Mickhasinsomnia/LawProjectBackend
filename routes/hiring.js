const {addHiring,updateHiring,cancelHiring,getHiring} = require('../controllers/hiring')

const express = require('express');
const router = express.Router();
const {protect,authorize} = require ('../middleware/auth')

router.route('/:id').get(protect,authorize('user','lawyer'),getHiring).put(protect,authorize('lawyer'),updateHiring).delete(protect,authorize('lawyer'),cancelHiring);

router.post('/create/:id', protect, authorize('lawyer'), addHiring);

module.exports = router;
