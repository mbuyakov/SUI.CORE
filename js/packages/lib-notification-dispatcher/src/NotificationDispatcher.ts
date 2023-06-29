import {EventManager} from "@sui/lib-event-manager";
import {SingletonAndOnlyIoc} from "@sui/deps-ioc";
import * as React from "react";
import {NotificationArgsProps} from "./types";
import {ErrorEvent, NotificationCloseEvent, NotificationEvent} from "./events";

abstract class NotificationDispatcher extends EventManager<NotificationEvent | ErrorEvent | NotificationCloseEvent> {
  public abstract success(title: React.ReactNode, message?: React.ReactNode, args?: NotificationArgsProps): void;

  public abstract info(title: React.ReactNode, message?: React.ReactNode, args?: NotificationArgsProps): void;

  public abstract warning(title: React.ReactNode, message?: React.ReactNode, args?: NotificationArgsProps): void;

  public abstract error(title: React.ReactNode, message?: React.ReactNode, args?: NotificationArgsProps): void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public abstract handleError(e: any, title?: string): void;

  public abstract close(key: string): void;
}

export class NotificationDispatcherImpl extends NotificationDispatcher {
  public override success(title: React.ReactNode, message?: React.ReactNode, args?: NotificationArgsProps) {
    // noinspection JSIgnoredPromiseFromCall
    this.dispatch(NotificationEvent, new NotificationEvent("SUCCESS", title, message, args));
  }

  public override info(title: React.ReactNode, message?: React.ReactNode, args?: NotificationArgsProps) {
    // noinspection JSIgnoredPromiseFromCall
    this.dispatch(NotificationEvent, new NotificationEvent("INFO", title, message, args));
  }

  public override warning(title: React.ReactNode, message?: React.ReactNode, args?: NotificationArgsProps) {
    // noinspection JSIgnoredPromiseFromCall
    this.dispatch(NotificationEvent, new NotificationEvent("WARNING", title, message, args));
  }

  public override error(title: React.ReactNode, message?: React.ReactNode, args?: NotificationArgsProps) {
    // noinspection JSIgnoredPromiseFromCall
    this.dispatch(NotificationEvent, new NotificationEvent("ERROR", title, message, args));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public override handleError(e: any, title = "Ошибка при обработке запроса") {
    console.error(title, e);
    if (!(e instanceof Error)) {
      e = new Error(e);
    }
    // noinspection JSIgnoredPromiseFromCall
    this.dispatch(ErrorEvent, new ErrorEvent(title, e));
  }


  public override close(key: string) {
    // noinspection JSIgnoredPromiseFromCall
    this.dispatch(NotificationCloseEvent, new NotificationCloseEvent(key));
  }
}

const _NotificationDispatcher = SingletonAndOnlyIoc(NotificationDispatcher);
export {_NotificationDispatcher as NotificationDispatcher};
