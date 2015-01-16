var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');
var mongoose = require('mongoose');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');
// var Users = require('../app/collections/users');
// var Links = require('../app/collections/links');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find(function(err,links) {
    res.send(200, links);
  })
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  Link
    .findOne({ url: uri }, 'url', function(err, link) {
    if (link) {
      res.send(200, link.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var newLink = {
          url: uri,
          title: title,
          base_url: req.headers.origin,
          visits: 0
        };

        Link.create(newLink, function(err, newLink) {
          if(err) {
            console.log(err);
          } else {
            res.send(200, newLink);
          }
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User
  .findOne({ username: username },function(err, user) {
      if (!user) {
        res.redirect('/login');
      } else {
        user.comparePassword(password, function(match) {
          if (match) {
            util.createSession(req, res, user);
          } else {
            res.redirect('/login');
          }
        })
      }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User
    .findOne({ username: username }, 'username', function(err, user) {
      if (!user) {
        var newUser = {
          username: username,
          password: password
        };
        User.create(newUser,function(err,newUser) {
          if(err) {
            console.log(err);
          } else {
            util.createSession(req, res, newUser);
          }
        });
      } else {
        console.log('Account already exists');
        res.redirect('/signup');
      }
    })
};

exports.navToLink = function(req, res) {
  Link
    .findOne({ code: req.params[0] }, function(err, link) {
    if (!link) {
      res.redirect('/');
    } else {
      Link.update({ code: req.params[0] }, {'visits': link.get('visits') + 1}, function(err, numberAffected, raw){
        return res.redirect(link.get('url'));
      });
    }
  });
};
