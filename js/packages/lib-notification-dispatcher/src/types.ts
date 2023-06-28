import {ArgsProps} from "@sui/deps-antd";

export type NotificationSeverity = "SUCCESS" | "INFO" | "WARNING" | "ERROR";
export type NotificationArgsProps = Omit<ArgsProps, "message">;
