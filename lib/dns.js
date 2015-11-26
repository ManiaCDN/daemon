
'use strict';

var config = require('./config');

var pool = require('./database').pool;

var namecheap = require('./api/namecheap');
var _ = require('underscore');

var ip = null;

module.exports = {};
module.exports.initApi = function(nip) {
    ip = nip;

    namecheap.ip = nip;
    namecheap.user = config.domain.namecheap.user;
    namecheap.key = config.domain.namecheap.key;
};

module.exports.updateRecords = function (callback) {
    // Get default stack
    var records = config.domain.records;

    // Get records from db
    pool.query('SELECT server.serverid, server.status, server.ip4, server.ip6, server.active FROM server WHERE server.active = 1 AND server.status < 4 AND server.status > 0;', function(err, rows, fields) {
        for(var i = 0; i < rows.length; i++) {
            let row = rows[i];

            let ip4 = row.ip4;
            let ip6 = row.ip6;

            var record = null;

            if (ip4) {
                record = _.clone(config.domain.rrtemplate.ipv4);
                record.Address = ip4;
            }
            if (ip6) {
                record = _.clone(config.domain.rrtemplate.ipv4);
                record.Address = ip6;
            }

            // Add to the updatable list
            records.push(record);
        }

        // Update NameCheap
        namecheap.dns.setHosts('maniacdn', 'net', records, function (err, res) {
            if (err) {
                console.error(err);
                return callback(err);
            }

            return callback(null);
        });

    });

    return callback(null, true);
};
