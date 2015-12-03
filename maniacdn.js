
'use strict';

/**
 * Module dependencies.
 */
var database = require('./lib/database');
var moira = require('moira');
var async = require('async');

var dns = require('./lib/dns');

var ipAddress = null;

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
        database.makeConnection(function () {
            console.log("Database connection made!");

            require('debug')('ManiaCDN:server');
            require('./check');

            return callback(null);
        });
    }
], function(err) {
    if (err) {
        console.error(err);
        process.exit(1);
    }
});
