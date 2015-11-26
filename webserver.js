var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var config = require('./lib/config');
var pool = require('./lib/database').pool;

var handlebars = require('express-handlebars');

var routes = {};
    routes.about = require('./routes/about');
    routes.api = require('./routes/api');

var app = express();

app.engine('handlebars', handlebars({defaultLayout: 'main'}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

// Setup basic middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/', routes.about);
app.use('/api', routes.api);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        console.error(err);
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
