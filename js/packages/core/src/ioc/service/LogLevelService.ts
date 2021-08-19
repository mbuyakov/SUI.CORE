/* eslint-disable @typescript-eslint/ban-ts-comment */
import autobind from "autobind-decorator";
import {Singleton} from 'typescript-ioc';
import {Nullable} from '@/other';

// noinspection ES6PreferShortImport
import {ROOT_LOGGER_KEY} from '../const';
// noinspection ES6PreferShortImport
import {LoggerLevel} from '../enum';

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
  public getLogLevel(key: string): LoggerLevel {
    return this.logLevels.get(key) || this.logLevels.get(ROOT_LOGGER_KEY);
  }

  @autobind
  public isLevelEnabled(key: Nullable<string>, level: LoggerLevel): boolean {
    return this.getLogLevel(key) >= level;
  }

}
