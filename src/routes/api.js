const passport = require('passport');
var express = require('express');
var router = express.Router();

const requireAuth = passport.authenticate('jwt', {session: false});

const UserController = require('../controllers/user');

router.post('/signup', UserController.signup);
router.post('/signin', UserController.signin);
router.get('/me', requireAuth, UserController.me);
router.post('/changePassword', requireAuth, UserController.changePassword);
router.post('/update', requireAuth, UserController.update);
router.get('/users', requireAuth, UserController.getusers);

module.exports = router