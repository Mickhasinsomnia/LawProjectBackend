const {addHiring,updateHiring,cancelHiring,getHiring,getHiringByClientId,getHiringByLawyerId} = require('../controllers/hiring')

const express = require('express');
const router = express.Router();
const {protect,authorize} = require ('../middleware/auth')

router.get('/client/:clientId', protect, authorize('user','admin'), getHiringByClientId);
router.get('/lawyer/:lawyerId', protect, authorize('lawyer','admin'), getHiringByLawyerId);

router.post('/create/:id',protect, authorize('lawyer','admin'), addHiring);

router.route('/:id').get(protect,getHiring).put(protect,authorize('lawyer'),updateHiring).delete(protect,authorize('lawyer'),cancelHiring);



module.exports = router;
