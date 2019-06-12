import { restMap } from '../models'

var express = require('express');
var router = express.Router();

const passport = require('passport');
const requireAuth = passport.authenticate('jwt', {session: false});

const methodOverride = require('method-override')
const restify = require('express-restify-mongoose')

router.use(methodOverride())

restMap.forEach(({name, model}) => {
	restify.serve(router, model, {
	  name,
	  totalCountHeader: 'X-Total-Count',
	  preMiddleware: requireAuth
	})
})

module.exports = router
