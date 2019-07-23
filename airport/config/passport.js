const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const db = require('../models/dbconnect');


module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      
      let sql = `SELECT * FROM users WHERE email= '${email}' `;
      db.query(sql, ( err, rows )=>{
            if( err ){
              return done(null, false, { message: 'Unable to connect' });
            }
            // Match user
            if( Object.keys( rows ).length == 0){
              return done(null, false, { message: 'That email is not registered' });
            }
            
            console.log( rows[0].password);
            console.log("login");
            // Match password
          bcrypt.compare(password, rows[0].password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {

            return done(null, rows[0] );
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
      
    })
  );


  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });


  passport.deserializeUser(function(id, done) {
    /*User.findById(id, function(err, user) {
      done(err, user);
    });*/
    let sql = `SELECT * FROM users WHERE id= ${id} `;
    db.query(sql, (err, rows)=>{
      done( err , rows[0] ); 
    });
  });
};