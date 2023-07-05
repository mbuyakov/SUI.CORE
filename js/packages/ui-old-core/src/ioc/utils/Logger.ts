/* eslint-disable no-console,@typescript-eslint/no-explicit-any,@typescript-eslint/no-unused-vars */
import {Container} from "@sui/deps-ioc";
import {getTOrCall, TOrCallback} from "@sui/util-chore";
import {OneOrArray, wrapInArray} from "@/typeWrappers";
// Don't touch import
// noinspection ES6PreferShortImport
import {LogLevelService} from "../service/LogLevelService";
// noinspection ES6PreferShortImport
import {LoggerLevel} from "../enum";
// Don't touch import
// noinspection ES6PreferShortImport


// Can't use @Autowired due to @InjectLogger
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
      console.error(this.prefix, ...wrapInArray(getTOrCall(msg)), e);
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
