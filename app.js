var createError = require('http-errors');
const http = require('http')
// const socketio = require('socket.io')
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fileupload = require('express-fileupload')
var hbs = require('express-handlebars')
const paypal = require('paypal-rest-sdk');
var app = express();
// const server = http.createServer(app)
// const io = socketio(server) 
// var io = require('socket.io').listen(server);
const log = console.log
require('dotenv').config()
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': process.env.client_id,
  'client_secret': process.env.client_secret
});

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
const db = require('./config/connection');
const { hasSubscribers } = require('diagnostics_channel');

db.connect((err)=>{
  if(err) console.log('connection to database failed');
  else console.log('connected to database ')
})
const port=  4000



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({extname:'hbs', defaultLayout:'layout', layoutsDir:__dirname+'/views/layout/', partialsDir:__dirname+'/views/partials/'}))
// app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutDir:__dirname  + '/views/layout/',partialsDir:__dirname+'/views/partials'}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileupload())
// caching disabled for every route
// app.use(function(req, res, next) {
//   res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
//   next();
// });

// hbs.registerPartials(__dirname+'/views/admin/partials/')
// hbs.registerPartials('partials',path.join(__dirname,'partials'))

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error',{no__partials:true});
});

app.listen(port,(err,success)=>{
  if(err) console.log('failed to load ')
  else console.log(`listening on port ${port}`)
})





    // Gonna take a risk :)

module.exports = app;
