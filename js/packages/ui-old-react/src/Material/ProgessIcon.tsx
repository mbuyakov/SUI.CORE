// Migrated to @sui/ui-promised


import {Nullable} from "@sui/ui-old-core";
import {CircularProgress, CircularProgressProps} from "@mui/material";
import React from "react";

export type ProgressIconProps = Omit<CircularProgressProps, 'size'> & {
  size: Nullable<"small" | "medium" | "large">;
  type: "icon" | "iconButton";
}

export const ProgressIcon: React.FC<ProgressIconProps> = ({size, type, ...rest}) => {
  let _size = type === "icon" ? 16 : 24;

  if (size === "small") {
    _size -= 4;
  }

  if (size === "large") {
    _size += 4;
  }

  return (
    <CircularProgress
      {...rest}
      size={_size}
    />
  );
}
