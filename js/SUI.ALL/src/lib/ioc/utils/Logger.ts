/* eslint-disable no-console,@typescript-eslint/no-explicit-any */
// Can't use @Inject in this class. Problem from @InjectLogger
import { Container } from 'typescript-ioc';
import { getTOrCall, TOrCallback } from '../../other';
import { OneOrArray, wrapInArray } from '../../typeWrappers';
import { LogLevelService } from '../service/LogLevelService';
import { LoggerLevel } from '../enum';

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

  public warn(msg: TOrCallback<OneOrArray<any>>): void {
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
