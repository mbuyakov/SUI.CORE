import React from "react";
import {Nullable} from "@sui/util-types";
import {CircularProgress, CircularProgressProps} from "@sui/deps-material";

export type ProgressIconProps = Omit<CircularProgressProps, "size"> & {
  size: Nullable<"small" | "medium" | "large">;
  type: "icon" | "iconButton";
};

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
};
