import User from '../models/user'
import logger from '../utils/logger'
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');

export const tokenForUser = function(user) {
  const timestamp = new Date().getTime();
  return jwt.sign({sub: user.id, iat: timestamp}, process.env.SECRET || 'apollo-jwt')
}

exports.signin = async function (req, res, next) {
  let { username, password } = req.body;
  logger.info(`login by username`, username);

  let user = await User.findByLogin(username);
  if (!user) {
    res.status(401).send({error: 'Authentication failed. User not found.'});
  } else {
    const isValid = await user.validatePassword(password);
    if (!isValid) {
      res.status(401).send({error: 'Authentication failed. Wrong password.'});
    } else {
      res.json({success: true, token: tokenForUser(user)});
    }
  }
}

exports.signup = async function (req, res, next) {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    res.status(401).send({error: 'You must provide username and password'});
  } else {
    const user = new User({username, password});

    try {
      await user.save();
      res.json({success: true, msg: 'Successful created new user.'})
    } catch(err) {
      res.status(401).send({error: 'Username already exists.'});
    }
  }
}

exports.me = async function(req, res, next) {
  logger.info(`login by jwt`, req.user.username);
  let currentUser = req.user;
  res.json({_id: req.user._id, username: req.user.username, dispName: req.user.dispName, mobileNo: req.user.mobileNo, 
      role: req.user.role, parentId: req.user.parentId});
}

exports.update = async function(req, res, next) {
  let user = req.body.user;
  //console.log(user);
  let newuser = await User.findByIdAndUpdate(req.user._id, {$set: {mobileNo: user.mobileNo, dispName: user.dispName}}, {new: true}).exec();
  logger.info(`${user.dispName} updated`, user.username);
	res.json({r_id: newuser._id, username: newuser.username, role: newuser.role});

}

exports.getusers = async function(req, res, next) {
    if (req.user.role != 'admin') {
        throw new Error('not permitted');
    }
    const users = await User.find({}).exec();
    res.json(users.map((user)=>({id: user.id, dispName: user.dispName, role: user.role})));
}

exports.changePassword = async function(req, res, next) {
    const { oldPassword, newPassword } = req.body;

    logger.info(`change password`, req.user.username);

    // Check if user is in database
    try {
      let existingUser = await User.findOne({
          _id: mongoose.Types.ObjectId(req.user._id)
      }).exec();

      if (existingUser) {
          const isValid = await existingUser.validatePassword(oldPassword);
          if (!isValid) {
              return res.json({ error: 'password not match' });;
          }
          existingUser.password = await existingUser.generatePasswordHash(newPassword);
          // Update user in database
          try {
            await User.update({
                _id: mongoose.Types.ObjectId(req.user._id)
            }, existingUser).exec();
            // Find and return updated user  - note this is necessary because update does not return the doc
            await User.findOne({
                _id: mongoose.Types.ObjectId(req.user._id)
            },'-password').exec();
            res.json({error: null})
          } catch(err) {
            res.json({ error: 'Error updating password. Try again later' });
          }
      }
      else {
          // Could not find user to update in db
          return res.json({ error: 'Hmm...Cannot locate account. Try again later' })
      }
    } catch( err ) {
      res.json({ error: 'Error accessing account. Try again later' });
    }
}