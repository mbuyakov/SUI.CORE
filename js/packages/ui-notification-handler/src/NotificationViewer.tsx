import React from "react";
import {notification} from "@sui/deps-antd";
import {Typography} from "@sui/deps-material";
import {useHandler, useService} from "@sui/lib-hooks";
import {ErrorEvent, NotificationDispatcher, NotificationEvent, NotificationCloseEvent} from "@sui/lib-notification-dispatcher";

export const NotificationViewer: React.FC<{
  children?: React.ReactNode
}> = ({children}) => {
  const [api, contextHolder] = notification.useNotification();
  const notificationDispatcher = useService(NotificationDispatcher);

  useHandler(notificationDispatcher.addHandler<NotificationEvent>(NotificationEvent, (event) => {
    switch (event.severity) {
      case "SUCCESS":
        api.success({
          message: event.title,
          description: event.message,
          ...event.args
        });
        break;
      case "INFO":
        api.info({
          message: event.title,
          description: event.message,
          ...event.args
        });
        break;
      case "WARNING":
        api.warning({
          message: event.title,
          description: event.message,
          ...event.args
        });
        break;
      case "ERROR":
        api.error({
          message: event.title,
          description: event.message,
          ...event.args
        });
        break;
    }
  }), []);

  useHandler(notificationDispatcher.addHandler<ErrorEvent>(ErrorEvent, (event) => {
    api.error({
      message: event.title,
      description: (
        <>
          <Typography>
            {event.error.toString()}
          </Typography>
          <Typography variant="body2" style={{whiteSpace: "pre"}}>
            {event.error.stack}
          </Typography>
        </>
      )
    });
  }), []);

  useHandler(notificationDispatcher.addHandler<NotificationCloseEvent>(NotificationCloseEvent, (event) => {
    api.destroy(event.key);
  }), []);

  return (
    <>
      {contextHolder}
      {children}
    </>
  );
};
