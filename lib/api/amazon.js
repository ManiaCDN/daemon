
'use strict';

var config = require('./../config');

var Route = require('nice-route53');

let zone = config.domain.amazon.zone;

var route = new Route({
    accessKeyId     : config.domain.amazon.key,
    secretAccessKey : config.domain.amazon.secret
});

var api = {};

/**
 * Get records
 * @return {Promise}
 */
api.records = function() {
    return new Promise(function(resolve, reject) {
        route.records(zone, function(err, records) {
            if (err) {return reject(err);}

            return resolve(records);
        });
    });
};

/**
 * Set record SET!
 * @param host {string} hostname (full!)
 * @param type {string} type. A or AAAA
 * @param ttl {int} TTL
 * @param geocontinent {string} (AF | AN | AS | EU | OC | NA | SA)
 * @param setId {string} Set Identifier (_eur)
 * @param recValues {string[]}
 * @return {Promise}
 */
api.setRecord = function (host, type, ttl, geocontinent, setId, recValues) {
    return new Promise(function(resolve, reject) {
        var opts = {
            zoneId : zone,
            name   : host,
            type   : type,
            ttl    : ttl,
            values : recValues,
            setid  : setId,
            geo    : {
                continent: geocontinent
            }
        };
        route.setRecord(opts, function (err, response) {
            if (err) {return reject(err);}
            return resolve(response);
        });
    });
};

/**
 * Delete record
 * @param host {string} hostname (full!)
 * @param type {string} type. A or AAAA
 * @param ttl {int} TTL
 * @param geocontinent {string} (AF | AN | AS | EU | OC | NA | SA)
 * @param setId {string} Set Identifier (_eur)
 * @return {Promise}
 */
api.removeRecord = function (host, type, ttl, geocontinent, setId) {
    return new Promise(function(resolve, reject) {
        var opts = {
            zoneId : zone,
            name   : host,
            type   : type,
            ttl    : ttl,
            setid  : setId,
            geo    : {
                continent: geocontinent
            }
        };
        route.delRecord(opts, function (err, response) {
            if (err) {return reject(err);}
            return resolve(response);
        });
    });
};

module.exports = api;

