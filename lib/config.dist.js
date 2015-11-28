
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
            {host: 'about', type: 'A', data: '...', ttl: 300}
        ],

        // Template for the round robin entries
        template: {
            ipv4: {host: '', type: 'A', data: '', ttl: 300},
            ipv6: {host: '', type: 'AAAA', data: '', ttl: 300}
        },

        // Api settings
        namecheap: {
            user: '...',
            key: '...'
        },

        zerigo: {
            user: '...',
            key: '...',
            zone: '...'
        },

        amazon: {
            key: '...',
            secret: '...',
            zone: '...'
        }
    }
};
