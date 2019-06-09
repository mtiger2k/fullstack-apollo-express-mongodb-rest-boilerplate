import models from '../models';

var express = require('express');
var router = express.Router();

const passport = require('passport');
const requireAuth = passport.authenticate('jwt', {session: false});

const methodOverride = require('method-override')
const restify = require('express-restify-mongoose')

router.use(methodOverride())

Object.keys(models).forEach(modelName => {
	restify.serve(router, models[modelName], {
	  totalCountHeader: 'X-Total-Count',
	  preMiddleware: requireAuth
	})
})

module.exports = router
