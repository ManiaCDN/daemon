
'use strict';

module.exports = {};

module.exports.middleware = require('./authentication/middleware');


var auth = function(req) {
    this.req = req;
};

/**
 * Init request
 */
auth.prototype.isAuthenticated = function () {
    if (this.req.hasOwnProperty('auth.user') && this.req.hasOwnProperty('auth.time')) {
        return true;
    }

    return false;
};


module.exports.auth = auth;
