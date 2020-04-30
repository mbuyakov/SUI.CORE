import { OnlyInstantiableByContainer, Singleton } from 'typescript-ioc';
import { Nullable } from '../../other';
import { LoggerLevel } from '../enum';
import { ROOT_LOGGER_KEY } from '../const';

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
