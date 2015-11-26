
'use strict';

var request = require('request');

var parser = require('xml2json');
var _ = require('underscore');


let base = "https://api.namecheap.com/xml.response";
let baseOptions = {
    headers: {
        'User-Agent': 'ManiaCDN/1.0.0'
    }
};


module.exports = {};

module.exports.user = null;
module.exports.key = null;
module.exports.ip = null;

module.exports.dns = {};

// https://api.namecheap.com/xml.response?ApiUser=apiexample&ApiKey=56b4c87ef4fd49cb96d915c0db68194&UserName=apiexample&Command=namecheap.domains.dns.getHosts&ClientIp=192.168.1.109&SLD=domain&TLD=com
module.exports.dns.getHosts = function(domain, tld, callback) {
    validateCredentials();

    let url = getBaseUrl() + '&Command=namecheap.domains.dns.getHosts&SLD=' + domain + '&TLD=' + tld;

    let options = _.extend(baseOptions, {});

    request(url, options, function(err, res, body) {
        if (err || res.statusCode !== 200) {
            return callback(Error('Error with contacting API server. Maybe wrong api creds or whitelisted IP? ' + err));
        }

        let json = parser.toJson(body, {object: true});


        try {
            let response = json.ApiResponse.CommandResponse.DomainDNSGetHostsResult;
            var hosts = response.host;

            if (!Array.isArray(hosts)) {
                hosts = [hosts];
            }

            return callback(null, hosts);
        } catch (err2) {
            return callback(err2);
        }
    });
};


module.exports.dns.setHosts = function (domain, tld, records, callback) {
    validateCredentials();

    let url = getBaseUrl() + '&Command=namecheap.domains.dns.setHosts&SLD=' + domain + '&TLD=' + tld;

    var data = {};
    for (var i = 0; i < records.length; i++) {
        let rec = records[i];

        for (var key in rec) {
            if (rec.hasOwnProperty(key)) {
                data[key + '' + (i+1) + ''] = rec[key];
            }
        }
    }

    let options = _.extend(baseOptions, {
        form: data
    });

    request.post(url, options, function(err, res, body) {
        if (err || res.statusCode !== 200) {
            return callback(Error('Error with contacting API server. Maybe wrong api creds or whitelisted IP? ' + err));
        }

        let json = parser.toJson(body, {object: true});

        try {
            let success = json.ApiResponse.Status;

            if (success == 'OK') {
                return callback(null);
            }

            return callback(Error('Error, success not found on response status: ' + success));
        }catch (err2) {
            return callback(err);
        }
    });
};


function validateCredentials() {
    if (!module.exports.user || !module.exports.key || !module.exports.ip) {throw Error('No user/key/ip is given! Please set it first!');}
}

function getBaseUrl() {
    return base + '?ApiUser=' + module.exports.user + '&ApiKey=' + module.exports.key + '&UserName=' + module.exports.user + '&ClientIp=' + module.exports.ip;
}
