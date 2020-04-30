/* eslint-disable no-console,@typescript-eslint/no-explicit-any */
import { Container, OnlyInstantiableByContainer, Singleton } from 'typescript-ioc';
import { getTOrCall, Nullable, TOrCallback } from '../other';
import { OneOrArray, wrapInArray } from '../typeWrappers';

export const ROOT_LOGGER_KEY = "ROOT";

// Please, don't touch. Magic from typescript-ioc
export function InjectLogger(...args: any[]): any {
  const target = args[0] as Function;
  const key = args[1] as string;

  const propKey = `__${key}`;
  Object.defineProperty(target.constructor.prototype, key, {
    enumerable: true,
    // eslint-disable-next-line object-shorthand,func-names
    get: function () {
      return this[propKey] ? this[propKey] : this[propKey] = new Logger(target.constructor.name);
    },
    // eslint-disable-next-line object-shorthand,func-names
    set: function (newValue) {
      this[propKey] = newValue;
    }
  });
}

enum LoggerLevel {
  ERROR,
  WARNING,
  INFO,
  DEBUG,
  TRACE
}

// Can't use @Inject in this class. Problem from @InjectLogger
export class Logger {

  private readonly name: string;
  private readonly prefix: string;

  public constructor(name: string) {
    this.name = name;
    this.prefix = `[${name}]`;
  }

  private logLevelService: LogLevelService = Container.get(LogLevelService);

  public error(e: Error, msg: TOrCallback<OneOrArray<any>>): void {
    if (this.logLevelService.isLevelEnabled(this.name, LoggerLevel.ERROR)) {
      console.error(this.prefix, ...wrapInArray(getTOrCall(msg)));
      console.error(e);
    }
  }

  public warn(e: Error, msg: TOrCallback<OneOrArray<any>>): void {
    if (this.logLevelService.isLevelEnabled(this.name, LoggerLevel.ERROR)) {
      console.warn(this.prefix, ...wrapInArray(getTOrCall(msg)));
    }
  }

  public info(msg: TOrCallback<OneOrArray<any>>): void {
    if (this.logLevelService.isLevelEnabled(this.name, LoggerLevel.INFO)) {
      console.log(this.prefix, ...wrapInArray(getTOrCall(msg)));
    }
  }

  public debug(msg: TOrCallback<OneOrArray<any>>): void {
    if (this.logLevelService.isLevelEnabled(this.name, LoggerLevel.DEBUG)) {
      console.debug(this.prefix, ...wrapInArray(getTOrCall(msg)));
    }
  }

  public trace(msg: TOrCallback<OneOrArray<any>>): void {
    if (this.logLevelService.isLevelEnabled(this.name, LoggerLevel.TRACE)) {
      console.trace(this.prefix, ...wrapInArray(getTOrCall(msg)));
    }
  }
}

@OnlyInstantiableByContainer
@Singleton
export class LogLevelService {

  private logLevels = new Map<string, LoggerLevel>();

  public constructor() {
    this.logLevels.set(ROOT_LOGGER_KEY, LoggerLevel.INFO);
    // @ts-ignore
    window.setLogLevel = this.setLogLevel;
    // @ts-ignore
    window.getLogLevel = this.getLogLevel;
  }

  public setLogLevel(key: string, level: LoggerLevel): void {
    this.logLevels.set(key, level);
  }

  public getLogLevel(key: string): LoggerLevel {
    return this.logLevels.get(key) || this.logLevels.get(ROOT_LOGGER_KEY);
  }

  public isLevelEnabled(key: Nullable<string>, level: LoggerLevel): boolean {
    return this.getLogLevel(key) >= level;
  }
}
