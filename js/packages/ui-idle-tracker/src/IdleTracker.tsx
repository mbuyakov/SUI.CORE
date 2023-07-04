import React from "react";
// eslint-disable-next-line no-restricted-imports
import {IdleTimerProvider} from "react-idle-timer";

export const IdleTracker: React.FC<React.PropsWithChildren<{
  timeout: number,
  onIdle: () => void,
  onActive: () => void,
}>> = (props) => (
  <IdleTimerProvider
    onIdle={props.onIdle}
    onActive={props.onActive}
    timeout={props.timeout}
  >
    {props.children}
  </IdleTimerProvider>
);
