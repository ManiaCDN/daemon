
'use strict';

let h6 = 21600;
let h12 = 2*h6;
let h24 = 2*h12;

var request = require('request');
var moment = require('moment');


module.exports = {};


/**
 * Check Server Timestamp. Will inpersonate the Host in http request to get right mapping (vhosts)
 * @param ip {string}
 * @param port {int}
 * @param currentStatus {int}
 * @param callback {function}
 */
module.exports.checkServer = function (ip, port, currentStatus, callback) {
    // IPv6 addins
    if (ip.indexOf(':') > -1) {
        ip = '[' + ip + ']';
    }

    let url = 'http://' + ip + ':' + port + '/timestamp.txt';

    request(url, {
        headers: {
            'Host': 'maniacdn.net',
            'User-Agent': 'ManiaCDN Bot/1.0.0'
        }
    }, function (err, res, body) {
        if (err || !body) {
            return callback(err || Error('No body response!'));
        }

        let serverStamp = parseInt(body.replace(new RegExp('\n', 'g'),''));
        let currentStamp = moment().unix();

        /**
         * Status:
         *  0 - Unknown
         *  1 - Up-to-date    (between 0-6h ago updated)
         *  2 - Up-to-date    (between 6-12h ago updated)
         *  3 - Behind        (between 12-24h ago updated)
         *  4 - Not updating  (24h+ ago updated)
         * @type {number}
         */
        var status = 0;

        if (isNaN(serverStamp) || res.statusCode !== 200) {
            status = 0;
        }else{
            // Get difference
            let difference = currentStamp - serverStamp;

            if (difference > h24) {
                status = 4;
            }
            if (difference < h24 && difference > h12) {
                status = 3;
            }
            if (difference < h12 && difference > h6) {
                status = 2;
            }
            if (difference < h6 && difference > 0) {
                status = 1;
            }
        }
        // Else it will stay 0


        // Determinate updates
        let statusUpdate = (currentStatus !== status);
        let dnsUpdate = statusUpdate && (status == 0 || status >= 4);

        // Give command to update or not
        return callback(null, statusUpdate, dnsUpdate, status);
    });
};

