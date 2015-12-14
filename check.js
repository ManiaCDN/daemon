
'use strict';

var async = require('async');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var moment = require('moment');

var config = require('./lib/config');

var pool = require('./lib/database').pool;

var timechecker = require('./lib/timechecker');
var dns = require('./lib/dns');

setInterval(checkServers, 900000); // 15 min = 900000

// Mail transporter
var transporter = nodemailer.createTransport(smtpTransport({
    port: 25,
    host: 'localhost',
    secure: false,
    ignoreTLS: true
}));


var inCheck = false;
function checkServers(forceDnsUpdate) {
    if (inCheck) {return;}
    inCheck = true;

    var reportList = [];

    // Get servers from database
    pool.query('SELECT server.*, maintainer.email FROM server, maintainer WHERE server.maintainerid = maintainer.maintainerid AND server.active = 1;', function (err, rows) {
        if (err) {
            console.error(err);
            inCheck = false;
            return;
        }

        // Hold if we need to update DNS
        var DNSUpdate = false;
        var AnyUpdate = false;

        console.log('==== STARTING SERVER CHECKS ====');

        // Start timestamp checker
        async.eachSeries(rows, function(row, callback) {
            let serverid = row.serverid;
            let ip4 = row.ip4;
            let ip6 = row.ip6;
            let status = row.status;
            let email = row.email;

            let ip = ip4 || ip6;

            console.log('  Checking ' + ip + '...');
            // Chech the server for status
            timechecker.checkServer(ip, 80, status, function (err, needUpdate, needDNSUpdate, newStatus) {
                console.log('     --> OldStatus: ' + status + ', newStatus: ' + newStatus);

                // Add to report
                if (needUpdate) {
                    reportList.push("Server (#" + serverid + ") " + ip + " has not been changed. STATUS = " + newStatus);
                    AnyUpdate = true;
                }else{
                    reportList.push("Server (#" + serverid + ") " + ip + " changed from OLDSTATUS = " + status + " to STATUS = " + newStatus);
                }

                // Set the global dns update flag when status has changed and made the server inactive.
                if (needDNSUpdate) {
                    DNSUpdate = true;
                }

                // Update database entry when status has been changed. And e-mail owner.
                if (needUpdate) {
                    // Database update
                    pool.query('UPDATE server SET status = ? WHERE serverid = ?;', [newStatus, serverid], function (err) {
                        if (err) {
                            console.error(err);
                        }

                        return callback(null);
                    });

                    // If status >= 4 then send mail too
                    if (newStatus >= 4) {
                        transporter.sendMail({
                            from: config.admin.sender,
                            to: email,
                            bcc: config.admin.email,
                            subject: 'Your mirror is outdated! (ip: ' + ip + ')',
                            text: 'Hello, Your mirror (' + ip + ') is outdated, it hasn\'t been updating in over 24 hours! Please check the status of your sync script. (E-mail automaticly generated! Dont reply).'
                        });
                    }
                }else{
                    return callback(null);
                }
            });
        }, function() {
            console.log('==== Server Checks Done ====');

            // Force updating dns on first boot!
            if (forceDnsUpdate) {
                DNSUpdate = true;
            }

            // Do the DNS Update
            if (DNSUpdate) {
                console.log('==== DNS Update needed.. Executing... ====');
                dns.updateRecords(function () { // err, success
                    inCheck = false;
                    sendReport(AnyUpdate, reportList);

                    console.log('==== Done ====');
                });
            }else{
                inCheck = false;
                sendReport(AnyUpdate, reportList);
            }
        });
    });
}

function sendReport(updated, reportList) {
    if (updated) {
        transporter.sendMail({
            from: config.admin.sender,
            to: config.admin.email,
            subject: 'ManiaCDN.net: Update list (' + moment().format('DD-MM-YYYY HH:mm:ss') + ')',
            text: 'Changes logged: \n\n' + reportList.join('\n') + '\n\n\nAuto Generated!'
        });
    }
}

// Run first time at boot of server checker
checkServers(true);
