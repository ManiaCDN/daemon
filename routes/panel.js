
'use strict';

var express = require('express');
var router = express.Router();

var authRequired = require('./../lib/authentication').middleware.requireAuthenticated;

router.use('/secure/*', authRequired);

router.get('/login', function (req, res, next) {
    res.render('panel/login', {

    });
});

router.get('/secure/', function (req, res, next) {
    res.render('panel/index');
});



/**
 *  Get panel home.
 */
router.get('/', function (req, res, next) {
    res.redirect('/panel/secure/');
    res.end();
});

module.exports = router;
