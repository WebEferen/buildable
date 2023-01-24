import chalk from 'chalk';

import { CliOptions } from '../../lib/modules/options.js';
import { Logger } from '../../lib/modules/logger.js';

describe('Logger', () => {

    it('should log message', () => {
        const logSpy = (message) => message;

        const options = new CliOptions({ customLoggers: {
            log: (message) => logSpy(message)
        } });

        const logger = new Logger(options);
        expect(logger.log('Test')).toBe('Test');
    });

    it('should log with prefix', () => {
        const logSpy = (message) => message;

        const options = new CliOptions({ customLoggers: {
            log: (message) => logSpy(message)
        } });

        const logger = new Logger(options);
        expect(logger.log('Test', 'Prefix')).toBe('Prefix Test');
    });

    it('should verbose log message', () => {
        const logSpy = (message) => message;

        const options = new CliOptions({ verbose: true, customLoggers: {
            verbose: (message) => logSpy(message)
        } });

        const logger = new Logger(options);
        const verboseText = logger.format('[Verbose]', 'yellow');

        expect(logger.verbose('Test')).toBe(`${verboseText} Test`);
    });

    it('should error log message', () => {
        const logSpy = (message) => message;

        const options = new CliOptions({ verbose: true, customLoggers: {
            error: (message) => logSpy(message)
        } });

        const logger = new Logger(options);
        expect(logger.error('Test')).toBe(logger.format(`Test`, 'red'));
    });

    it('should error with prefix', () => {
        const logSpy = (message) => message;

        const options = new CliOptions({ verbose: true, customLoggers: {
            error: (message) => logSpy(message)
        } });

        const logger = new Logger(options);
        expect(logger.error('Test', 'Prefix')).toBe(logger.format(`Prefix Test`, 'red'));
    });

    it('should error with gray color', () => {
        const logSpy = (message) => message;

        const options = new CliOptions({ verbose: true, customLoggers: {
            error: (message) => logSpy(message)
        } });

        const logger = new Logger(options);
        expect(logger.error('Test', 'Prefix', 'gray')).toBe(logger.format(`Prefix Test`, 'gray'));
    });

    it('should format message', () => {
        const logger = new Logger();
        expect(logger.format('Test', 'gray')).toBe(chalk.gray('Test'));
    });
});