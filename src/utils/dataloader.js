// config.set(`../../${process.env.CRASH_COURSE_CONFIG_FILE || 'config.json'}`);

const redis = require('../config/redisclient');
const menusJSON = require('../../data/menus.json');
const mekanlarJSON = require('../../data/mekanlar.json');
// const locationsJSON = require("../../data/locations.json");

const redisClient = redis.getClient();

const CONSUMER_GROUP_NAME = 'checkinConsumers';

const usage = () => {
  console.error('Usage: npm run load users|locations|locationdetails|checkins|indexes|bloom|all');
  process.exit(0);
};

const loadData = async (jsonArray, keyName) => {
  const pipeline = redisClient.pipeline();

  for (const obj of jsonArray) {
    pipeline.hset(redis.getKeyName(keyName, obj.id), obj);
  }

  const responses = await pipeline.exec();
  let errorCount = 0;

  for (const response of responses) {
    if (response[0] !== null) {
      errorCount += 1;
    }
  }

  return errorCount;
};

const loadLocations = async () => {
  console.log('Loading location data...');
  /* eslint-disable global-require */
  const locationsJSON = require('../../data/locations.json');
  /* eslint-enable */

  const errorCount = await loadData(locationsJSON.locations, 'locations');
  console.log(`Location data loaded with ${errorCount} errors.`);
};

const loadLocationDetails = async () => {
  console.log('Loading location details...');
  /* eslint-disable global-require */
  const locationsJSON = require('../../data/locationdetails.json');
  /* eslint-enable */

  const pipeline = redisClient.pipeline();

  // eslint-disable-next-line no-restricted-syntax
  for (const locationDetail of locationsJSON.locationDetails) {
    pipeline.call('JSON.SET', redis.getKeyName('locationdetails', locationDetail.id), '.', JSON.stringify(locationDetail));
  }

  const responses = await pipeline.exec();

  let errorCount = 0;

  for (const response of responses) {
    if (response[0] !== null && response[1] !== 'OK') {
      errorCount += 1;
    }
  }

  console.log(`Location detail data loaded with ${errorCount} errors.`);
};

const createIndexes = async () => {
  console.log('Dropping any existing indexes, creating new indexes...');

  const locationsIndexKey = redis.getKeyName('locationsidx');

  const pipeline = redisClient.pipeline();

  pipeline.call('FT.DROPINDEX', locationsIndexKey);

  pipeline.call(
    'FT.CREATE',
    locationsIndexKey,
    'ON',
    'HASH',
    'PREFIX',
    '1',
    redis.getKeyName('locations'),
    'SCHEMA',
    'category',
    'TAG',
    'SORTABLE',
    'location',
    'GEO',
    'SORTABLE',
    'numCheckins',
    'NUMERIC',
    'SORTABLE',
    'numStars',
    'NUMERIC',
    'SORTABLE',
    'averageStars',
    'NUMERIC',
    'SORTABLE'
  );

  const responses = await pipeline.exec();

  if (responses.length === 4 && responses[2][1] === 'OK' && responses[3][1] === 'OK') {
    console.log('Created indexes.');
  } else {
    console.log('Unexpected error creating indexes :(');
    console.log(responses);
  }
};

const runDataLoader = async (params) => {

  const command = params[3];

  switch (command) {
    case 'locations':
      await loadLocations();
      break;
    case 'locationdetails':
      await loadLocationDetails();
      break;
    case 'indexes':
      await createIndexes();
      break;
    case 'all':
      await loadLocations();
      await loadLocationDetails();
      await createIndexes();
      break;
    default:
      await loadLocations();
  }

  redisClient.quit();
};

// runDataLoader(process.argv);
