var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var config = require('./lib/config');
var pool = require('./lib/database').pool;

var handlebars = require('express-handlebars');

var routes = {};
    routes.about = require('./routes/about');
    routes.api = require('./routes/api');
    routes.panel = require('./routes/panel');

var app = express();

/**
 * View Settings
 */
app.engine('handlebars', handlebars({defaultLayout: 'main'}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

/**
 * Middleware
 */
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));

app.use(cookieParser());
app.use(session({
    secret: config.secret,
    saveUninitialized: true,
    resave: false
}));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


/**
 * Routes
 */
app.use('/', routes.about);
app.use('/api', routes.api);
app.use('/panel', routes.panel);


/**
 * Catchall
 */
app.use(function (req, res, next) {
    var err = new Error('Not Found: ' + req.path);
    err.status = 404;
    next(err);
});


/**
 * Error Catchers
 */


// error handler
app.use(function (err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') return next(err);

    // handle CSRF token errors here
    res.status(403);
    res.send('form tampered with');
});

// development error handler
// will print stacktrace
if (config.development) {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        console.error(err);
        res.send();
        /*res.render('error', {
            message: err.message,
            error: err
        });*/
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    console.error(err);
    /*res.render('error', {
        message: err.message,
        error: {}
    });*/
});


module.exports = app;
