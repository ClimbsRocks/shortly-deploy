var db = require('../config');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// define schema
var userSchema = new Schema({
  userID: ObjectId,
  username: String,
  password: String
});


// assign function to the 'methods' object of our schema
userSchema.methods.hashPassword = function(){
  var cipher = Promise.promisify(bcrypt.hash);
  // COME BACK: check on syntax of getting
  return cipher(this.get('password'), null, null).bind(this)
    .then(function(hash) {
      this.set('password', hash);
    });
};

userSchema.methods.comparePassword = function(attemptedPassword, callback) {
  bcrypt.compare(attemptedPassword, this.get('password'), function(err, isMatch) {
    callback(isMatch);
  });
}

var User = db.model('User', userSchema);

//before we save the user, we hash their password.
userSchema.pre('save', function(next) {
  this.hashPassword().then(next);
});

module.exports = User;
