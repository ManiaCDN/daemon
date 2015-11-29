
'use strict';

var express = require('express');
var router = express.Router();

var csrf = require('csurf');
var csrfProtection = csrf({cookie: false});
var moment = require('moment');

var bcrypt = require('bcrypt');
var knex = require('./../lib/database').knex;

var Servers = require('./../services/Server');

var auth = require('./../lib/authentication');
var authRequired = auth.middleware.requireAuthenticated;
var authInit = auth.middleware.initAuthenticated;

/**
 * /Secure/* will need an active login
 */
router.use('/secure/*', authRequired);

/**
 * Login page (GET)
 */
router.get('/login', csrfProtection, function (req, res, next) {
    res.render('panel/login', {
        csrfToken: req.csrfToken()
    });
});

/**
 * Logout action
 */
router.get('/secure/logout', authInit, function (req, res, next) {
    req.auth.logout(req);
    res.redirect('/panel/login');
});

/**
 * Login action (POST)
 */
router.post('/login', csrfProtection, authInit, function (req, res, next) {
    if (!req.body.hasOwnProperty('username') || !req.body.hasOwnProperty('password')) {
        res.redirect('/panel/login?error');
        return;
    }

    let user = req.body.username;
    let pass = req.body.password;

    // Lookup the user
    require('./../services/Maintainer').maintainer({email: user})
    .then(function(rows) {
        if (rows.length === 0) {
            res.redirect('/panel/login?error');
            return;
        }

        let row = rows[0];

        req.auth.login(req, row.maintainerid, row.password, pass)
            .then(function() {
                res.redirect('/panel/secure/');
            })
            .catch(function() {
                res.redirect('/panel/login?error');
            });
    })
    .catch(function(err) {
        res.redirect('/panel/login?error');
    });
});






/**
 * Panel Home
 */
router.get('/secure/', function (req, res, next) {
    res.render('panel/index', {layout: 'panel'});
});

/**
 * Server List
 */
router.get('/secure/servers', function (req, res, next) {
    // Get servers for maintainer
    Servers.servers({
        maintainerid: req.auth.maintainer.maintainerid
    }).then(function(rows) {
        res.render('panel/servers', {layout: 'panel', servers: rows});
    }).catch(function() {
        res.render('panel/servers', {layout: 'panel', servers: []});
    });
});

/**
 * Server Edit
 */
router.get('/secure/servers/:serverid', function (req, res, next) {
    let serverid = req.params.serverid;

    Servers.servers({
        maintainerid: req.auth.maintainer.maintainerid,
        serverid: serverid
    }).then(function(rows) {
        if (rows.length == 0) {
            return res.redirect('/panel/secure/servers');
        }
        res.render('panel/serveredit', {layout: 'panel', server: rows[0]});
    }).catch(function() {
        res.redirect('/panel/secure/servers');
    });
});

/**
 * Server Edit Post
 */
router.post('/secure/servers/:serverid', function (req, res, next) {
    let serverid = req.params.serverid;

    Servers.servers({
        maintainerid: req.auth.maintainer.maintainerid,
        serverid: serverid
    }).then(function(rows) {
        if (rows.length == 0) {
            return res.redirect('/panel/secure/servers');
        }

        var newActive = rows[0].active;

        // Lets check for changes
        if (req.body.active && req.body.active === '1') {
            // Enable server
            newActive = 1;
        }else{
            // Disable server
            newActive = 0;
        }

        // Update
        knex('server').where({
            maintainerid: req.auth.maintainer.maintainerid,
            serverid: serverid
        }).update({
            active: newActive
        }).catch(function(err) {
            res.redirect('/panel/secure/servers?error');
        }).done(function() {
            res.redirect('/panel/secure/servers?done');
        });
    }).catch(function() {
        res.redirect('/panel/secure/servers');
    });
});


/**
 *  Redirect to panel home. Will automatically ask for login when not being in an active session.
 */
router.get('/', function (req, res, next) {
    res.redirect('/panel/secure/');
    res.end();
});

module.exports = router;
