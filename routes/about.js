
'use strict';

var express = require('express');
var router = express.Router();

var async = require('async');

var pool = require('./../lib/database').pool;

/**
 *  Get about home page
 */
router.get('/', function (req, res, next) {

    var mirrorsOnline = 0;
    var mirrors = [];

    let onlineCountSql = `
    SELECT
        COUNT(*) as online
    FROM
        server
    WHERE
        active = 1
        AND status > 0
        AND status < 4;
    `;

    let mirrorStatusSql = `
        SELECT * FROM server WHERE hidden = 0 ORDER BY active DESC;
    `;

    // First get queries done
    pool.query(onlineCountSql, function(err, rows, fields) {
        if (!err && rows.length > 0) {
            mirrorsOnline = rows[0].online;
        }

        pool.query(mirrorStatusSql, function(err, rows, fields) {
            if (!err && rows.length > 0) {
                mirrors = rows;
            }

            renderNow();
        });
    });


    function renderNow() {
        res.render('home', {
            mirrorsOnline: mirrorsOnline,
            mirrors: mirrors
        });
    }
});

module.exports = router;
