
'use strict';

/**
 * Module dependencies.
 */
var database = require('./lib/database');
var config = require('./lib/config');
var moira = require('moira');
var async = require('async');

var dns = require('./lib/dns');

var ipAddress = null;

var server = null;
var port = null;

async.series([
    function(callback) {
        moira.getIP(function(err, ip) {
            if (!err) {
                ipAddress = ip;
            }

            dns.initApi(ipAddress);

            return callback(err);
        });
    },
    function(callback) {
        database.makeConnection(function (err, connection) {
            console.log("Database connection made!");

            var webserver = require('./webserver');
            var check = require('./check');

            var debug = require('debug')('ManiaCDN:server');
            var http = require('http');

            /**
             * Get port from environment and store in Express.
             */
            port = normalizePort(config.webserver.port);
            webserver.set('port', port);

            /**
             * Create HTTP server.
             */
            server = http.createServer(webserver);

            /**
             * Listen on provided port, on all network interfaces.
             */
            server.listen(port);
            server.on('error', onError);
            server.on('listening', onListening);


            return callback(null);
        });
    }
], function(err) {
    if (err) {
        console.error(err);
        process.exit(1);
    }
});





/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    //debug('Listening on ' + bind);
    console.log('Listening on ' + bind);
    console.log('');
}