
'use strict';
var auth = require('./../authentication');

module.exports = {};

module.exports.requireAuthenticated = function (req, res, next) {
    if (req.auth) {return next(false);}

    req.auth = new auth.auth(req);

    // Check for autnentication
    if (req.auth.isAuthenticated()) {
        return next();
    }

    // Not authenticated
    // Redirect
    res.redirect('/panel/login');
};
