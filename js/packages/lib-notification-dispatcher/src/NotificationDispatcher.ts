import {EventManager} from "@sui/lib-event-manager";
import {SingletonAndOnlyIoc} from "@sui/deps-ioc";
import {NotificationEvent} from "./NotificationEvent";
import * as React from "react";
import {ErrorEvent} from "./ErrorEvent";
import {NotificationArgsProps} from "./types";

export abstract class NotificationDispatcher extends EventManager<NotificationEvent | ErrorEvent> {
  public abstract success(title: React.ReactNode, message?: React.ReactNode, args?: NotificationArgsProps): void

  public abstract info(title: React.ReactNode, message?: React.ReactNode, args?: NotificationArgsProps): void

  public abstract warning(title: React.ReactNode, message?: React.ReactNode, args?: NotificationArgsProps): void

  public abstract error(title: React.ReactNode, message?: React.ReactNode, args?: NotificationArgsProps): void

  public abstract handleError(e: Error, title?: string): void
}

class NotificationDispatcherImpl extends NotificationDispatcher {
  public success(title: React.ReactNode, message?: React.ReactNode, args?: NotificationArgsProps) {
    // noinspection JSIgnoredPromiseFromCall
    this.dispatch(NotificationEvent, new NotificationEvent("SUCCESS", title, message, args));
  }

  public info(title: React.ReactNode, message?: React.ReactNode, args?: NotificationArgsProps) {
    // noinspection JSIgnoredPromiseFromCall
    this.dispatch(NotificationEvent, new NotificationEvent("INFO", title, message, args));
  }

  public warning(title: React.ReactNode, message?: React.ReactNode, args?: NotificationArgsProps) {
    // noinspection JSIgnoredPromiseFromCall
    this.dispatch(NotificationEvent, new NotificationEvent("WARNING", title, message, args));
  }

  public error(title: React.ReactNode, message?: React.ReactNode, args?: NotificationArgsProps) {
    // noinspection JSIgnoredPromiseFromCall
    this.dispatch(NotificationEvent, new NotificationEvent("ERROR", title, message, args));
  }

  public handleError(e: Error, title = "Ошибка при обработке запроса") {
    // noinspection JSIgnoredPromiseFromCall
    this.dispatch(ErrorEvent, new ErrorEvent(title, e));
  }
}

const _NotificationDispatcherImpl = SingletonAndOnlyIoc(NotificationDispatcherImpl);
export {_NotificationDispatcherImpl as NotificationDispatcherImpl};
