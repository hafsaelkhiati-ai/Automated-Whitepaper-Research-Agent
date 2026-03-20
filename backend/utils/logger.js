/**
 * Utility: Logger
 * Simple structured logger — replace with Winston or Pino for production.
 */

const isDev = process.env.NODE_ENV !== "production";

export const logger = {
  info: (msg, ...args) => {
    console.log(`[${timestamp()}] INFO  ${msg}`, ...args);
  },
  warn: (msg, ...args) => {
    console.warn(`[${timestamp()}] WARN  ${msg}`, ...args);
  },
  error: (msg, ...args) => {
    console.error(`[${timestamp()}] ERROR ${msg}`, ...args);
  },
  debug: (msg, ...args) => {
    if (isDev) console.debug(`[${timestamp()}] DEBUG ${msg}`, ...args);
  },
};

function timestamp() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}
