import {Select} from "@sui/deps-antd";
import * as React from 'react';
import {DulService} from "@/soctech";

export interface IDulTypeSelectorProps {
  allowClear?: boolean
  disabled?: boolean
  value?: string

  onChange?(value: string): void
}

export class DulTypeSelector extends React.Component<IDulTypeSelectorProps> {
  public render(): React.ReactNode {
    return (
      <Select
        disabled={this.props.disabled}
        {...this.props}
      >
        {DulService.allDocTypes().sort((a, b) => a.sorting - b.sorting).map(docType => (<Select.Option key={docType.id} value={docType.id} children={docType.docName}/>))}
      </Select>
    );
  }
}
