
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

            var debug = require('debug')('ManiaCDN:server');
            var check = require('./check');

            return callback(null);
        });
    }
], function(err) {
    if (err) {
        console.error(err);
        process.exit(1);
    }
});
