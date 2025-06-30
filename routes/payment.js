const express = require('express');
const { addPayment ,getPayment,payVerify } = require('../controllers/payment');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const router = express.Router();

router.post('/create/:id',protect, authorize('lawyer'), addPayment);
router.get('/',protect,getPayment)
router.post('/:id',upload.single('file'),payVerify)

module.exports = router;
