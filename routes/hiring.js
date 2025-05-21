const {addHiring,updateHiring,cancelHiring} = require('../controllers/hiring')

const express = require('express');
const router = express.Router();
const {protect,authorize} = require ('../middleware/auth')

router.route('/:id').post(protect,authorize('lawyer'),addHiring).put(protect,authorize('lawyer'),updateHiring).delete(protect,authorize('lawyer'),cancelHiring);

module.exports = router;
