import {SuiEvent} from "@sui/lib-event-manager";
import * as React from "react";
import {NotificationArgsProps, NotificationSeverity} from "./types";
export class ErrorEvent extends SuiEvent {
  public readonly title: React.ReactNode;
  public readonly error: Error;

  constructor(title: React.ReactNode, error: Error) {
    super("ErrorEvent");
    this.title = title;
    this.error = error;
  }
}



export class NotificationEvent extends SuiEvent {
  public readonly severity: NotificationSeverity;
  public readonly title: React.ReactNode;
  public readonly message?: React.ReactNode;
  public readonly args?: NotificationArgsProps;

  constructor(severity: NotificationSeverity, title: React.ReactNode, message?: React.ReactNode, args?: NotificationArgsProps) {
    super("NotificationEvent");
    this.severity = severity;
    this.title = title;
    this.message = message;
    this.args = args;
  }
}

export class NotificationCloseEvent extends SuiEvent {
  public readonly key: string;

  constructor(key: string) {
    super("NotificationCloseEvent");
    this.key = key;
  }
}
