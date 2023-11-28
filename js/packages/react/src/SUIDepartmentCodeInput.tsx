import React, {useEffect} from "react";
import MaskedInput from "antd-mask-input";
import {MaskedInputProps} from "antd-mask-input/build/main/lib/MaskedInput";

export const SUIDepartmentCodeInput = (props: MaskedInputProps): JSX.Element => {

  useEffect(() => {
    if (!props.disabled && (props.value === '' || props.value === undefined)) {
      // @ts-ignore
      props.onChange(0)
    }
  }, [props.value, props.disabled])

  return (
    <MaskedInput
      {...props}
    />
  )
}
