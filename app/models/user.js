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
  console.log('inside of hashPassword');
  var cipher = Promise.promisify(bcrypt.hash);
  // COME BACK: check on syntax of getting
  return cipher(this.get('password'), null, null).bind(this)
    .then(function(hash) {
      console.log('inside of hashing', hash);
      this.set('password', hash);
      console.log(this);
    });
};

var User = db.model('User', userSchema);

userSchema.pre('save', function(next) {
  console.log('this inside of pre');
  console.log(this);

  this.hashPassword().then(next);
});

var omar = new User({username: 'omar', password: 'yo'});
// omar.hashPassword();

// save model to MongoDB
omar.save(function(err){
  if (err){
    console.log(err);
  } else {
    console.log('omar is safe!')
  }
});
console.log(omar);

/*var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  initialize: function(){
    this.on('creating', this.hashPassword);
  },
  comparePassword: function(attemptedPassword, callback) {
    bcrypt.compare(attemptedPassword, this.get('password'), function(err, isMatch) {
      callback(isMatch);
    });
  },
  hashPassword: function(){
    var cipher = Promise.promisify(bcrypt.hash);
    return cipher(this.get('password'), null, null).bind(this)
      .then(function(hash) {
        this.set('password', hash);
      });
  }
});*/

module.exports = User;
