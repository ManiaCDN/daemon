
'use strict';

var config = require('./config');

var pool = require('./database').pool;

var namecheap = require('./api/namecheap');
var zerigo = require('./api/zerigo');
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
    pool.query('SELECT server.serverid, server.continentcode, server.status, server.ip4, server.ip6, server.active FROM server WHERE server.active = 1 AND server.status < 4 AND server.status > 0;', function(err, rows, fields) {
        for(var i = 0; i < rows.length; i++) {
            let row = rows[i];

            let continent = row.continentcode;

            let ip4 = row.ip4;
            let ip6 = row.ip6;

            var record = null;

            if (ip4) {
                record = _.clone(config.domain.template.ipv4);
                record.host = '_' + continent;
                record.data = ip4;
            }
            if (ip6) {
                record = _.clone(config.domain.template.ipv6);
                record.host = '_' + continent;
                record.data = ip6;
            }

            // Add to the updatable list
            records.push(record);
        }

        zerigo.executeSync(records)
            .then(function() {console.log("DNS Updated!")})
            .catch(function(err) {console.error(err);});
    });

    return callback(null, true);
};
