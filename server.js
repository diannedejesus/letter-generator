const express = require('express')
const app = express()
const connectDB = require('./config/database')

const mainRoutes = require('./routes/mainRts')
const authRouter = require('./routes/auth');

//const mongoose = require('mongoose')
const passport = require('passport') // auth middleware
const session = require('express-session') // Keeps users session logged in and creates the cookie
const MongoStore = require('connect-mongo') //saving session data in the db
const flash = require('connect-flash');
//const cookieParser = require('cookie-parser');

require('dotenv').config({path: '.env'})

// Passport config
require('./config/passport')(passport)

connectDB()

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true })) 
app.use(express.json())



app.use(
  session({
    secret: process.env.YourSECRECT, //this can be anything you want
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
      mongoUrl: process.env.DB_STRING
    }),
  })
)


// Flash middleware
app.use(flash());


app.use(function(req, res, next) {

  // Read any flashed errors and save in the response locals
  res.locals.error = req.flash('error_msg');

  // Check for simple error string and convert to layout's expected format
  let errs = req.flash('error');
  for (let i in errs){
    res.locals.error.push({message: 'An error occurred', debug: errs[i]});
  }
  next();
});

//app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Passport middleware
app.use(passport.initialize()) //setting up passport
app.use(passport.session())

app.use('/', mainRoutes)
app.use('/auth', authRouter);

app.listen(process.env.PORT, ()=>{
    console.log(`Server is running on PORT: ${process.env.PORT} , you better catch it!`)
})    