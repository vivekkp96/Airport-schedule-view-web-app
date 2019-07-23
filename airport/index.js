const express = require('express');
const expressLayouts = require('express-layouts');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');

const app = express();


// Passport Config
require('./config/passport')(passport);

// Express session
app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
    })
  );

  
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});


app.use(expressLayouts);
app.set('view engine', 'ejs');

app.use('/', require('./routes/app'));
app.use('/plain', require('./routes/plain'));
app.use('/csv', require('./routes/csv'));
app.use('/users', require('./routes/users'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, (err) => {
    if(!err)
    console.log(`server started on ${PORT}` );

})