module.exports = {
	apps: [
		{
			name: 'ssh-client',
			script: 'npx',
			args: 'serve@latest out',
			instances: 1,
			exec_mode: 'fork',
			autorestart: true,
			watch: false,
			max_memory_restart: '200M',
			node_args: '--max-old-space-size=200',
			min_uptime: '10s',
			max_restarts: 10,
			restart_delay: 4000,
			kill_timeout: 5000,
			wait_ready: false,
			listen_timeout: 10000,
			shutdown_with_message: true,
			merge_logs: true,
			time: true,
			env: {
				NODE_ENV: 'production',
				PORT: 3000
			},
			log_file: './logs/combined.log',
			out_file: './logs/out.log',
			error_file: './logs/error.log',
			log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
			pmx: true,
			automation: false,
			treekill: true,
			force: false
		}
	]
};
