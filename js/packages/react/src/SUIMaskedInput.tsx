import MaskedInput from 'antd-mask-input';
import {MaskedInputProps} from 'antd-mask-input/build/main/lib/MaskedInput';
import React from 'react';
import {v4 as uuidv4} from 'uuid';

const defaultPasteFormatter = (it: string): string => it.replace(/[^0-9a-zа-яё]/gi, '');

export interface ISUIMaskedInputProps extends Omit<MaskedInputProps, "id" | "onChange"> {
  onChange?(value: string): void;

  pasteFormatter?(value: string): string;
}

export function SUIMaskedInput(props: ISUIMaskedInputProps): JSX.Element {
  const {pasteFormatter, ...inputProps} = props;

  const id = React.useMemo(() => `SUIMaskedInput-${uuidv4()}`, []);
  const inputRef = React.useRef<MaskedInput>();

  const onChange = (): void => {
    if (inputProps.onChange) {
      inputProps.onChange(inputRef.current.state.mask.getRawValue().replace(/_/g, ''))
    }
  };

  // Old code ???
  React.useEffect((): void => inputRef.current.state.mask.setValue(inputProps.value));

  // Paste magic effect
  React.useEffect((): void => {
    const input = document.getElementById(id) as HTMLInputElement;
    input.onpaste = (e): void => {
      const pastedValue = e.clipboardData.getData("Text");

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      e.clipboardData.getData = (format: string): string => {
        if (format === "Text") {
          return (pasteFormatter || defaultPasteFormatter)(pastedValue);
        } else {
          throw new Error(`Unexpected format: ${format}`);
        }
      }
    };
  });

  return (
    <MaskedInput
      {...inputProps}
      id={id}
      mask={inputProps.mask}
      ref={inputRef}
      onChange={onChange}
    />
  );
}
