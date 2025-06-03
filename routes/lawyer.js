const express = require('express');
const multer = require('multer');
const { protect, authorize } = require('../middleware/auth');
const { addLawyer, getLawyerById, updateLawyer, deleteLawyer, getAllLawyers,changeVerifyStatus } = require('../controllers/lawyer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const router = express.Router();

router.route('/').post(protect, authorize('lawyer'), upload.single('image'),addLawyer).get(getAllLawyers);

router.route('/:id').get(getLawyerById).put(protect, authorize('lawyer'), upload.single('image'),updateLawyer).delete(protect, authorize('lawyer'),upload.single('image'), deleteLawyer);

router.route('/:id/status').put(protect, authorize('admin'), changeVerifyStatus);



module.exports = router;
