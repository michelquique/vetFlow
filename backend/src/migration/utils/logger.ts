import * as fs from 'fs';
import * as path from 'path';

export class MigrationLogger {
  private logDir: string;
  private logFile: string;
  private errorFile: string;

  constructor(logDir: string = './migration-logs') {
    this.logDir = logDir;
    
    // Crear directorio si no existe
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    this.logFile = path.join(logDir, `migration-${timestamp}.log`);
    this.errorFile = path.join(logDir, `errors-${timestamp}.log`);

    this.info('Logger inicializado');
  }

  info(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [INFO] ${message}`;
    console.log(logMessage);
    this.writeToFile(this.logFile, logMessage);
  }

  success(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [SUCCESS] ${message}`;
    console.log('\x1b[32m%s\x1b[0m', logMessage); // Green
    this.writeToFile(this.logFile, logMessage);
  }

  warn(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [WARN] ${message}`;
    console.warn('\x1b[33m%s\x1b[0m', logMessage); // Yellow
    this.writeToFile(this.logFile, logMessage);
  }

  error(message: string, error?: any): void {
    const timestamp = new Date().toISOString();
    const errorDetails = error ? `\n${JSON.stringify(error, null, 2)}` : '';
    const logMessage = `[${timestamp}] [ERROR] ${message}${errorDetails}`;
    console.error('\x1b[31m%s\x1b[0m', logMessage); // Red
    this.writeToFile(this.logFile, logMessage);
    this.writeToFile(this.errorFile, logMessage);
  }

  private writeToFile(filePath: string, message: string): void {
    try {
      fs.appendFileSync(filePath, message + '\n', 'utf-8');
    } catch (error) {
      console.error('Error escribiendo al log:', error);
    }
  }
}
