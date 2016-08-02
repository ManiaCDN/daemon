
'use strict';

var config = require('./config');

var pool = require('./database').pool;

var amazon = require('./api/amazon');
var async = require('async');

var ip = null;

module.exports = {};
module.exports.initApi = function(nip) {
    ip = nip;
};

module.exports.updateRecords = function (callback) {
    if (config.development) {
        console.log('Not executing.. In DEV mode!');
        return callback();
    }

    var conts = ['AF','AN','AS','EU','OC','NA','SA'];

    var continent4 = {
        'AF': [],
        'AN': [],
        'AS': [],
        'EU': [],
        'OC': [],
        'NA': [],
        'SA': []
    };

    var continent6 = {
        'AF': [],
        'AN': [],
        'AS': [],
        'EU': [],
        'OC': [],
        'NA': [],
        'SA': []
    };

    // Get records from db
    pool.query('SELECT server.serverid, server.continentcode, server.status, server.ip4, server.ip6, server.active FROM server WHERE server.active = 1 AND server.status < 4 AND server.status > 0;', function(err, rows) {
        for(var i = 0; i < rows.length; i++) {
            let row = rows[i];

            let cont = row.continentcode;

            let ip4 = row.ip4;
            let ip6 = row.ip6;

            if (ip4) {
                continent4[cont].push(ip4);
            }
            if (ip6) {
                continent6[cont].push(ip6);
            }
        }

        async.eachSeries(conts, function (c, cll) {

            var pactions = [];

            if (continent4[c].length === 0) {
                pactions.push(amazon.removeRecord('maniacdn.net.', 'A', 600, c, c));
            }else{
                pactions.push(amazon.setRecord('maniacdn.net', 'A', 600, c, c, continent4[c]));
            }

            if (continent6[c].length === 0) {
                pactions.push(amazon.removeRecord('maniacdn.net.', 'AAAA', 600, c, c));
            }else{
                pactions.push(amazon.setRecord('maniacdn.net', 'AAAA', 600, c, c, continent6[c]));
            }

            Promise.all(pactions)
                .then(function () {
                    return cll();
                }).catch(function() {
                    return cll();
            });
        }, function(err) {
            if (err) {console.error(err);}
            return callback(null, true);
        });
    });
};
