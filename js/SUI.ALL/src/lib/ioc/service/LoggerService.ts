/* eslint-disable no-console */
import { OnlyInstantiableByContainer, Singleton } from 'typescript-ioc';
import { getTOrCall, TOrCallback } from '../../other';

enum LoggerLevel {
  ERROR,
  WARNING,
  INFO,
  DEBUG,
  TRACE
}

@OnlyInstantiableByContainer
@Singleton
export class LoggerService {
  private level = LoggerLevel.INFO;

  public setLevel(level: LoggerLevel): void {
    this.level = level;
  }

  public isLevelEnabled(level: LoggerLevel): boolean {
    return this.level >= level;
  }

  public error(e: Error, msg: TOrCallback<string>): void {
    if (this.isLevelEnabled(LoggerLevel.ERROR)) {
      console.error(getTOrCall(msg));
      console.error(e);
    }
  }

  public warn(msg: TOrCallback<string>): void {
    if (this.isLevelEnabled(LoggerLevel.WARNING)) {
      console.warn(getTOrCall(msg));
    }
  }

  public info(msg: TOrCallback<any>): void {
    console.log(this.info.caller);
    if (this.isLevelEnabled(LoggerLevel.INFO)) {
      console.log(getTOrCall(msg));
    }
  }

  public debug(msg: TOrCallback<string>): void {
    this.info("st")
    if (this.isLevelEnabled(LoggerLevel.DEBUG)) {
      console.debug(getTOrCall(msg));
    }
  }

  public trace(msg: TOrCallback<string>): void {
    if (this.isLevelEnabled(LoggerLevel.TRACE)) {
      console.trace(getTOrCall(msg));
    }
  }
}
