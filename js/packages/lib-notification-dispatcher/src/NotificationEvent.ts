import {SuiEvent} from "@sui/lib-event-manager";
import {NotificationArgsProps, NotificationSeverity} from "./types";
import * as React from "react";

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
