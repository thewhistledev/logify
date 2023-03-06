const fs = require('fs');
const util = require('util');
const EventEmitter = require('events');



const levels = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4
};

class Logify extends EventEmitter {
  constructor(options = {}) {
    super();

    this.level = options.level || 'INFO';
    this.crashReporter = options.crashReporter || null;
    this.bugReport = options.bugReport || null;
    this.saveToFile = options.saveToFile || false;
    this.fileName = options.fileName || 'log.txt';

    if (this.saveToFile) {
      this.fileStream = fs.createWriteStream(this.fileName, { flags: 'a' });
      this.fileStream.write('\n\n\n');
    }
  }

  debug(message) {
    if (levels[this.level] <= levels['DEBUG']) {
      this.log('DEBUG', message);
    }
  }

  info(message) {
    if (levels[this.level] <= levels['INFO']) {
      this.log('INFO', message);
    }
  }

  warn(message) {
    if (levels[this.level] <= levels['WARN']) {
      this.log('WARN', message);
    }
  }

  error(message, error) {
    if (levels[this.level] <= levels['ERROR']) {
      this.log('ERROR', message, error);

      if (this.crashReporter) {
        this.crashReporter.report(error);
      }
    }
  }

  fatal(message, error) {
    if (levels[this.level] <= levels['FATAL']) {
      this.log('FATAL', message, error);

      if (this.crashReporter) {
        this.crashReporter.report(error);
      }

      if (this.bugReport) {
        this.bugReport.report(message, error);
      }

      process.exit(1);
    }
  }

  log(level, message, error = null) {
    const timestamp = new Date().toISOString();

    const logString = `${timestamp} [${level}] ${message}`;

    if (error) {
      const stackTrace = util.inspect(error.stack);
      this.emit('log', `${logString}\n${stackTrace}`);
    } else {
      this.emit('log', logString);
    }

    if (this.saveToFile) {
      this.fileStream.write(`${logString}\n`);

      if (error) {
        this.fileStream.write(`${stackTrace}\n`);
      }
    }
  }

  close() {
    if (this.saveToFile) {
      this.fileStream.end();
    }
  }
}


class IsEmpty extends String { //extends the string class to add IsEmpty which is not a native method of the string class.
    /**
     * Check if string is empty or not.
     * @param {*} string 
     * @returns a true or false value depending on whether the string is empty or not.
     */
    constructor(string) {
        return string.length === 0;
    }
}


module.exports = Logify, IsEmpty;
