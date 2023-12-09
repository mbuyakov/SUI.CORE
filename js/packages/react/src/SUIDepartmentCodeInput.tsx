import React from "react";
import MaskedInput from "antd-mask-input";
import {MaskedInputProps} from "antd-mask-input/build/main/lib/MaskedInput";

export const SUIDepartmentCodeInput = (props: MaskedInputProps): JSX.Element => {
  return <MaskedInput {...props}/>;
}
