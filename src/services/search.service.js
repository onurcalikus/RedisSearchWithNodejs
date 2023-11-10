const redis = require('../config/redisclient');

const searchByCategory = async (query) => {
  const queryString = `@category:{${query}}`;
  const searchResults = await redis.performSearch(redis.getKeyName('locationsidx'), queryString);
  return searchResults;
};

module.exports = {
  searchByCategory,
};
