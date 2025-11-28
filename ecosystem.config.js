module.exports = {
    apps: [{
        name: 'vaishnav-bhakti-backend',
        script: './server.js',
        cwd: './backend',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '500M',
        env: {
            NODE_ENV: 'production',
            PORT: 5000
        },
        error_file: '../logs/pm2-error.log',
        out_file: '../logs/pm2-out.log',
        log_file: '../logs/pm2-combined.log',
        time: true,
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }]
};
