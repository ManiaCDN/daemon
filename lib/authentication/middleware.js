
'use strict';
var auth = require('./../authentication');

module.exports = {};

module.exports.requireAuthenticated = function (req, res, next) {
    if (!req.auth) {
        req.auth = new auth.auth();
    }

    // Check for autnentication
    req.auth.isAuthenticated(req)
    .then(function() {
        return next();
    })
    .catch(function() {
        // Not authenticated
        // Redirect
        res.redirect('/panel/login');
    });
};

module.exports.initAuthenticated = function (req, res, next) {
    if (req.auth) {return next();}
    req.auth = new auth.auth();
    return next();
};
