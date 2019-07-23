const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// database
const db = require('../models/dbconnect');
const { forwardAuthenticated } = require('../config/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {    
        

    let sql = `SELECT name FROM users WHERE email = '${email}' `;
    db.query(sql,(err,rows)=>{
        if( err ){
            errors.push({ msg: 'Failed to register'});
            res.render('register', {
                errors,
                name,
                email,
                password,
                password2
            });
        }else{
            if( Object.keys( rows ).length !== 0 ){
                errors.push({ msg: `Sorry, that username's taken. Try another? ` });
                res.render('register', {
                errors,
                name,
                email,
                password,
                password2
            });
            }else{
                  bcrypt.genSalt(10, (err, salt)=>{
                      bcrypt.hash(password, salt, (err, hash)=>{
                          if(err) throw err;
                          console.log(hash);
                          console.log("register");
                          let sql = `INSERT INTO users(name, email, password) VALUES( '${name}', '${email}', '${hash}' )`;
                          db.query(sql, (err, result)=>{
                              if(err){
                                errors.push({ msg: 'Failed to register2'});
                                res.render('register', {
                                    errors,
                                    name,
                                    email,
                                    password,
                                    password2
                                });
                              }else{
                                req.flash(
                                    'success_msg',
                                    'You are now registered and can log in'
                                  );
                                  res.redirect('/users/login');
                              }
                          });
                      });
                  });
            }
        }
    });
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/airport',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
