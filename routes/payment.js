const express = require('express');
const { addPayment ,getPayment } = require('../controllers/payment');
const { protect, authorize } = require('../middleware/auth');


const router = express.Router();

router.post('/create/:id',protect, authorize('lawyer'), addPayment);
router.get('/',protect,getPayment)

module.exports = router;
