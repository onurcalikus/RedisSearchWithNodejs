const express = require('express');
const searchRoute = require('./search.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/search',
    route: searchRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
