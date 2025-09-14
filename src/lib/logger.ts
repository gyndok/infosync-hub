export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelOrder: LogLevel[] = ['debug', 'info', 'warn', 'error'];
const currentLevel: LogLevel = import.meta.env.DEV ? 'debug' : 'info';

function shouldLog(level: LogLevel) {
  return levelOrder.indexOf(level) >= levelOrder.indexOf(currentLevel);
}

function log(level: LogLevel, ...args: any[]) {
  if (!shouldLog(level)) return;
  const method = level === 'debug' ? 'debug' : level;
  // eslint-disable-next-line no-console
  console[method](...args);
}

const logger = {
  debug: (...args: any[]) => log('debug', ...args),
  info: (...args: any[]) => log('info', ...args),
  warn: (...args: any[]) => log('warn', ...args),
  error: (...args: any[]) => log('error', ...args),
};

export default logger;
