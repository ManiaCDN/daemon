
module.exports = {
    admin: {
        sender: 'bot@maniacdn.net',
        email: '...'
    },

    db: {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'maniacdn'
    },

    webserver: {
        port: 8889
    },

    domain: {
        // Static records, will be present at update on top of the update request
        records: [
            {HostName: 'status', RecordType: 'A', Address: '...', TTL: 300}
        ],

        // Template for the round robin entries
        rrtemplate: {
            ipv4: {HostName: '@', RecordType: 'A', Address: '', TTL: 300},
            ipv6: {HostName: '@', RecordType: 'AAA', Address: '', TTL: 300}
        },

        // Api settings
        namecheap: {
            user: '...',
            key: '...'
        }
    }
};
