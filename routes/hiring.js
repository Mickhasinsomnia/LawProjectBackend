const {addHiring,updateHiring,cancelHiring} = require('../controllers/hiring')

const express = require('express');
const router = express.Router();
const {protect,authorize} = require ('../middleware/auth')

router.route('/:id').post(protect,authorize('lawyer'),addHiring).put(updateHiring).delete(cancelHiring);

module.exports = router;
