import {SuiEvent} from "@sui/lib-event-manager";
import {NotificationSeverity} from "./types";
import * as React from "react";

export class ErrorEvent extends SuiEvent {
  public readonly title: React.ReactNode;
  public readonly error: Error;

  constructor(title: React.ReactNode, error: Error) {
    super("ErrorEvent");
    this.title = title;
    this.error = error;
  }
}
