const express = require('express');
const { param, query } = require('express-validator');
const searchController = require('../../controllers/search.controller');

const router = express.Router();

router.post('/category', searchController.searchByCategory);

module.exports = router;
