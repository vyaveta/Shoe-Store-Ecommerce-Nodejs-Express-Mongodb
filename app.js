var createError = require('http-errors');
const http = require('http')
const socketio = require('socket.io')
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fileupload = require('express-fileupload')
var hbs = require('express-handlebars')
const paypal = require('paypal-rest-sdk');
var app = express();
const server = http.createServer(app)
const io = socketio(server) 
// var io = require('socket.io').listen(server);
const log = console.log
 
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AQFcDqeYJQK2LZ0YbKFrh0r_PAFSShbgK5XTOJ25YxjtAWnq3QpYDNfoDuAHu9EzB-lCVTdUMK3kP3MS',
  'client_secret': 'EB_f8QlJSFuW6zRueNatOW4x6UJC13AjZfFrHeZS6UMwqYbp-cWOuX9OVJVeUGMj6p_5qP7bg0_EHNxZ'
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
const port=4000



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
io.on('connection', socket => {
  log('new ws connection!')
  socket.on('joinRoom', ({ username , room }) => {
      const user = userJoin( socket.id ,  username , room)
      log(user,'from the server')
      socket.emit('message' , formatMessages(botname,'Welcome to Mini Web Chat!')) // This will only notify the user that has connected NOTICE!! - this will only send message to the connected user,so it is used to welcome the user with a welcome message ! :)
      socket.join(user.room)
      // This will notify everyBody else expect that user , since we dont want to notify the user that he/she has connected!  // io.emit() =>This code will notify or send message to everyone including the user 
      socket.broadcast.to(user.room).emit( 'message' , formatMessages ( `${user.username}`,'joined the chat!' )) 
      // Show the users list and the room info
      io.to(user.room).emit('roomUsers',{
          room:user.room,
          users:getRoomUsers(user.room)
      })
  })
  // Listen on chat message
  socket.on('chatMessage' , (msg) => {
      const user = getCurrentUser(socket.id)
      io.to(user.room).emit('message', formatMessages ( user.username , msg ))
      log(msg)
  })
  socket.on('disconnect' , () => {
      const user = userLeave(socket.id)
      if(user) {
          io.to(user.room).emit('message' , formatMessages ( botname , `${user.username} has left the chat!` ))
          io.to(user.room).emit('roomUsers',{
              room:user.room,
              users:getRoomUsers(user.room)
          })
      }
  })
})



module.exports = app;
