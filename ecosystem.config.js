// PM2 cluster configuration for production. Cluster mode lets the API use
// both vCPUs of the t3.medium box; without it a single Node process leaves
// one CPU idle while the other pegs at 100%. NODE_APP_INSTANCE is set per
// worker (0..N-1) so cron-style timers can be scoped to worker 0 only.
module.exports = {
  apps: [
    {
      name: "prajaakeeya-api",
      script: "dist/main.js",
      instances: parseInt(process.env.PM2_INSTANCES || "2", 10),
      exec_mode: "cluster",
      max_memory_restart: "900M",
      env_production: { NODE_ENV: "production" },
      error_file: "/var/log/pm2/api-error.log",
      out_file: "/var/log/pm2/api-out.log",
      merge_logs: true,
      time: true,
    },
  ],
};
