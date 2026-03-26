import pino from "pino"

const isServer = typeof window === "undefined"

const logger = pino({
	level: process.env.LOG_LEVEL || "info",
	transport: isServer
		? {
				targets: [
					{
						target: "pino/file",
						options: { destination: "/app/logs/next-app.log", mkdir: true },
					},
					{
						target: "pino-pretty",
						options: { colorize: true },
					},
				],
			}
		: undefined,
})

export default logger
