var db = require('../config');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var crypto = require('crypto');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// define schema
var linkSchema = new Schema({
  linkID: ObjectId,
  url: String,
  base_url: String,
  code: String,
  title: String,
  visits: Number
});

linkSchema.methods.cryptoSomething = function(callback, attrs, options) {
  var shasum = crypto.createHash('sha1');
  shasum.update(this.get('url'));
  this.set('code', shasum.digest('hex').slice(0, 5));
  callback();
}

var Link = db.model('Link', linkSchema);

//before we save the link, we crypto that
linkSchema.pre('save', function(next) {
  this.cryptoSomething(next);
});

var cnn = new Link({url:'http:www.cnn.com'});
console.log(cnn);
// cnn.save();

module.exports = Link;





/*var db = require('../config');
var crypto = require('crypto');

var Link = db.Model.extend({
  tableName: 'urls',
  hasTimestamps: true,
  defaults: {
    visits: 0
  },
  initialize: function(){
    this.on('creating', function(model, attrs, options){
      var shasum = crypto.createHash('sha1');
      shasum.update(model.get('url'));
      model.set('code', shasum.digest('hex').slice(0, 5));
    });
  }
});

module.exports = Link;*/
