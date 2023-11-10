const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');

const { searchService } = require('../services');
const logger = require('../config/logger');

const searchByCategory = catchAsync(async (req, res) => {
  logger.info(req.body.category);
  const result = await searchService.searchByCategory(req.body.category);
  res.status(200).json(result);
});

module.exports = {
  searchByCategory,
};
