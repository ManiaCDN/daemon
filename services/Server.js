
'use strict';

var knex = require('./../lib/database').knex;

module.exports = {};

/**
 * Search for servers
 * @param opts {object|undefined} Leave empty for all servers
 * @param opts.maintainerid {integer} filter on maintainer
 * @param opts.continent {string} filter on continent
 * @param opts.serverid {integer} server id
 * @return {Promise}
 */
module.exports.servers = function (opts) {
    var q = knex.select('*').from('server');

    if (opts) {
        q = q.where(opts);
    }

    return q;
};
