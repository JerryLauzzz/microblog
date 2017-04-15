var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var settings = require('./settings');
var flash = require('connect-flash');

var index = require('./routes/index');
var users = require('./routes/users');
// var hello = require('./routes/hello');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//cookie解析的中间件
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());


//提供session支持
app.use(session( {
    secret: settings.cookieSecret,
    key: settings.db,
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 7},
    store: new MongoStore({
        db: settings.db,
        url:'mongodb://localhost/' + settings.db
    }),
    resave: false,
    saveUninitialized: false
}));

app.use(function (req, res, next) {
    // console.log("app.usr local");
    res.locals.user = req.session.user;
    res.locals.post = req.session.post;

    var error = req.flash('error');
    res.locals.error = error.length ? error : null;

    var success = req.flash('success');
    res.locals.success = success.length ? success : null;
    next();
});

app.use('/', index);
app.use('/user', users);
// app.use('/u/:username', hello);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
