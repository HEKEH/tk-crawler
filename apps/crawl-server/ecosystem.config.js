const path = require('node:path');
const { name } = require('./package.json');

module.exports = {
  apps: [
    {
      name,
      script: path.resolve(__dirname, './dist/index.js'),
      out_file: '/dev/null', // 标准输出日志
      error_file: '/dev/null', // 错误日志
      instances: 1,
      autorestart: true,
      watch: ['dist', 'public', '../../.env.production'],
      ignore_watch: ['logs', 'logs/*'],
      exec_mode: 'fork',
      node_args: '-r dotenv/config', // 注入.env参数
      env_production: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      },
    },
  ],
};
