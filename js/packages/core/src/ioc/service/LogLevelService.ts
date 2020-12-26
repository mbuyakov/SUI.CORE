import { Singleton } from 'typescript-ioc';
import autobind from "autobind-decorator";
import {isNotNull, Nullable} from '@/other';
import { LoggerLevel } from '../enum';
import { ROOT_LOGGER_KEY } from '../const';

@Singleton
export class LogLevelService {

  private logLevels = new Map<string, LoggerLevel>();

  public constructor() {
    this.logLevels.set(ROOT_LOGGER_KEY, LoggerLevel.INFO);
    if (window) {
      // @ts-ignore
      window.setLogLevel = this.setLogLevel;
      // @ts-ignore
      window.getLogLevel = this.getLogLevel;
    }
  }

  @autobind
  public setLogLevel(key: string, level: LoggerLevel): void {
    this.logLevels.set(key, level);
  }

  @autobind
  public getLogLevel(key: Nullable<string>): LoggerLevel {
    let ret: Nullable<LoggerLevel>;
    if (isNotNull(key)) {
      ret = this.logLevels.get(key);
    }
    return ret ?? this.logLevels.get(ROOT_LOGGER_KEY)!;
  }

  @autobind
  public isLevelEnabled(key: Nullable<string>, level: LoggerLevel): boolean {
    return this.getLogLevel(key) >= level;
  }
}
