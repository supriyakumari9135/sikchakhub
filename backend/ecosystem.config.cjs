/**
 * SikchaKhub.AI - PM2 Production Process Manager Configuration
 * Configured for Contabo VPS Multi-Core Cluster Execution
 */

module.exports = {
  apps: [
    {
      name: 'sikchakhub-api',
      script: 'dist/index.js',
      cwd: '/var/www/sikchakhub/backend',
      instances: 'max', // Scale to all available CPU cores on Contabo VPS
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      kill_timeout: 5000, // 5s grace period for active database transactions
      wait_ready: true,
      listen_timeout: 8000,
      env: {
        NODE_ENV: 'development',
        PORT: 5001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5001,
      },
      error_file: '/var/log/sikchakhub/pm2-error.log',
      out_file: '/var/log/sikchakhub/pm2-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};

