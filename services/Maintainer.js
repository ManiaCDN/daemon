
'use strict';

var knex = require('./../lib/database').knex;

module.exports = {};

/**
 * Search for maintainer
 * @param opts {null|object}
 * @param opts.email {string}
 * @return {Promise}
 */
module.exports.maintainer = function (opts) {
    var q = knex.select('*').from('maintainer');

    if (opts) {
        q = q.where(opts);
    }

    return q;
};
