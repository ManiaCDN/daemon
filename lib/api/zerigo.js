
'use strict';

var config = require('./../config');

var request = require('request');
var _ = require('underscore');
var parser = require('xml2json');
var async = require('async');

var diff = require('list-diff');


let user = config.domain.zerigo.user;
let key = config.domain.zerigo.key;
let zone = config.domain.zerigo.zone;


let base = "https://ns.zerigo.com/api/1.1/";


var DomainAction = function(action, continent, ip, id) {
    this.action = action;
    this.continent = continent;
    this.ip = ip;

    this.id = id || null;

    this.ttl = 300;
    this.type = (/([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)/.test(ip) ? 'A' : 'AAAA');
};

var api = {};

api.executeSync = function(newHosts) {
    return new Promise(function(resolve, reject) {
        api.getHosts()
            .then(function(hosts) {
                return api._syncCurrentWithNew(hosts, newHosts);
            })
            .then(function(rulesExecuted) {
                return resolve();
            })
            .catch(function(err) {
                return reject(err);
            })
    });
};

/**
 * Get hosts
 */
api.getHosts = function() {
    return api._request('zones/' + zone + '/hosts.xml', 'GET');
};

/**
 * Put new host
 * @param host {string}
 * @param ip {string}
 * @param ttl {integer}
 * @param type {string}
 */
api.putHost = function(host, ip, ttl, type) {
    var body = `<host>
                    <data>"+ip+"</data>
                    <host-type>"+type+"</host-type>
                    <hostname>"+host+"</hostname>
                    <ttl type="integer">"+ttl+"</ttl>
                </host>`;

    return api._request('zones/' + zone + '/hosts.xml', 'POST');
};

/**
 * Delete host
 * @param hostid {integer} ID of host
 */
api.deleteHost = function(hostid) {
    return api._request('hosts/' + hostid + '.xml', 'DELETE');
};





api._syncCurrentWithNew = function (givenCurrentHosts, givenNewHosts) {
    return new Promise(function (resolve, reject) {
        var desired = {'_afr': [], '_ant': [], '_asi': [], '_eur': [], '_nam': [], '_ocn': [], '_sam': []};
        var current = {'_afr': [], '_ant': [], '_asi': [], '_eur': [], '_nam': [], '_ocn': [], '_sam': []};

        var hostIds = [];

        var currentHosts;
        var desiredHosts;

        var actions = [];

        // First map hosts in hosts :D
        try {
            currentHosts = _.clone(givenCurrentHosts.hosts.host);
            desiredHosts = _.clone(givenNewHosts);
        }catch(err) {
            return reject(err);
        }

        var i = 0;

        // Loop the current hosts and place in new objects
        i = 0;
        for(; i < currentHosts.length; i++) {
            let hostname = currentHosts[i].hostname;
            let ip = currentHosts[i].data;
            if (/^.*_(afr|ant|asi|eur|nam|ocn|sam)$/.test(hostname)) {
                // Is one of the GeoIP hostnames. Add to array of geo location.
                current[hostname].push(ip);

                hostIds.push(currentHosts[i]);
            }
        }

        // Loop the desired hosts and check it
        i = 0;
        for(; i < desiredHosts.length; i++) {
            let hostname = desiredHosts[i].host;
            let ip = desiredHosts[i].data;
            if (/^.*_(afr|ant|asi|eur|nam|ocn|sam)$/.test(hostname)) {
                // Is one of the GeoIP hostnames. Add to array of geo location.
                desired[hostname].push(ip);
            }
        }

        // Loop through continents and do the difference check
        for(var continent in desired) {
            let differences = diff(current[continent], desired[continent]);

            if (differences.length > 0) {
                // There are differences for this continent
                // Loop
                i = 0;
                for(;i<differences.length;i++) {
                    let difference = differences[i];

                    if (difference.both) {
                        // No Action!
                    }else if(difference.left) {
                        // It is in the current, but not in desired
                        // We need to REMOVE

                        // Get ID for host
                        var id = null;
                        for(var j=0; j<hostIds.length; j++) {
                            if (hostIds[j].data === difference.value && hostIds[j].hostname === continent) {
                                id = hostIds[j].id.$t;
                            }
                        }

                        // Add to actions stack
                        if (id !== null) {
                            actions.push(new DomainAction('REMOVE', continent, difference.value, id));
                        }
                    }else if(difference.right) {
                        // It is in the desired, not yet in current
                        // We need to ADD, add to actions stack
                        actions.push(new DomainAction('ADD', continent, difference.value));
                    }
                }
            }
        }

        // Execute actions when present
        if (actions.length > 0) {
            api._executeActions(actions)
                .then(function(){return resolve(actions.length, actions);})
                .catch(function(err){return reject(err);})
        } else {
            return resolve(0, null);
        }
    });
};

api._executeActions = function(actions) {
    return new Promise(function (resolve, reject) {
        if (!actions) {return reject(Error('You must give an array with actions!'));}

        async.eachSeries(actions, function(action, callback){
            var prom;

            if (action.action == 'REMOVE') {
                console.log("-> DNS: Execute " + action.action + " on host: " + action.continent + " with ip: " + action.ip);

                api.deleteHost(action.id)
                    .then(function() {callback();})
                    .catch(function(err) {callback();})
                ;
            }

            if (action.action == 'ADD') {
                console.log("-> DNS: Execute " + action.action + " on host: " + action.continent + " with ip: " + action.ip);

                api.putHost(action.continent, action.ip, action.ttl, action.type)
                    .then(function() {callback();})
                    .catch(function(err) {callback();})
                ;
            }
        }, function() {
            return resolve();
        });
    });
};



api._request = function (path, method, options) {
    // Init request, return promise
    return new Promise(function (resolve, reject) {

        options = options || {};

        var defaultOptions = {
            method: method,
            url: base + path,

            auth: {
                user: user,
                pass: key
            },

            headers: {
                'User-Agent': 'ManiaCDN-zerigo-client/1.0.0',
                'Content-Type': 'application/xml'
            },

            timeout: 5000
        };

        options = _.extend(defaultOptions, options);

        // Execute request
        request(options, function (error, response, body) {
            if (!response || error || response.statusCode >= 300) {
                error = error || Error("Response code not correct (" + response.statusCode + ") Body: " + body);
                return reject(error);
            }

            try {
                let json = parser.toJson(body, {object: true});

                return resolve(json);
            }catch(err) {
                return reject(err);
            }
        });
    });
};

module.exports = api;
