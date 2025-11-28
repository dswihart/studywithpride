module.exports = {
  apps: [{
    name: "frontend",
    script: "node_modules/next/dist/bin/next",
    args: "start",
    cwd: "/var/www/studywithpride/frontend",
    instances: 1,
    exec_mode: "fork",
    autorestart: true,
    watch: false,
    max_memory_restart: "500M",
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    env: {
      NODE_ENV: "production",
      PORT: 3000
    }
  }]
}
