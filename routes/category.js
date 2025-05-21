const {getCategory,addCategory,updateCategory} = require('../controllers/category')

const {protect,authorize} = require('../middleware/auth')

const express = require('express');
const router = express.Router();

router.route('/').post(protect,addCategory);

router.route('/:id').put(protect,authorize('admin'),updateCategory);

router.route('/:id').get(getCategory);

module.exports = router;
