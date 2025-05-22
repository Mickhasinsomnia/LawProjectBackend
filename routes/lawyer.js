const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { addLawyer, getLawyerById, updateLawyer, deleteLawyer, getAllLawyers } = require('../controllers/lawyer');

const router = express.Router();

router.route('/').post(protect, authorize('lawyer'), addLawyer).get(getAllLawyers);

router.route('/:id').get(getLawyerById).put(protect, authorize('lawyer'), updateLawyer).delete(protect, authorize('lawyer'), deleteLawyer);

module.exports = router;
