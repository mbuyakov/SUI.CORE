import * as React from 'react';
import classNames from 'classnames';
import autobind from 'autobind-decorator';
import {BackendTable} from "@/BackendTable/BackendTable";
import {ExtractProps} from '@/other';

// TODO: Мусор - переделать
export interface IFormItemBackendTableInputNodeProps<TSelection> {
  value?: string | string[]
  multiSelection?: boolean

  onChange?(value: string | string[]): void
}

export type IBackendTableInputNodeProps<TSelection> =
  Omit<ExtractProps<BackendTable<TSelection>>, "singleSelection" | "initialSelection">
  & IFormItemBackendTableInputNodeProps<TSelection>;

export class BackendTableInputNode<TSelection = string> extends React.Component<IBackendTableInputNodeProps<TSelection>, {}> {
  private baseTableRef: React.RefObject<BackendTable<TSelection>> = React.createRef<BackendTable<TSelection>>();

  public render(): React.ReactNode {
    return (
      <BackendTable<TSelection>
        paperStyle={{width: "calc(100% - 12px)"}}
        className={classNames(this.props.className, "sui-backend-table-input-node")}
        {...this.props}
        selectionEnabled={this.props.selectionEnabled ?? true}
        singleSelection={!this.props.multiSelection}
        onSelectionChange={values => {
          this.props.onChange(!!values.filter(Boolean) && (!!this.props.multiSelection ? values.filter(Boolean).map(value => value.toString()) : values[0]?.toString()));
          if (this.props.onSelectionChange) {
            this.props.onSelectionChange(values)
          }
        }}
      />
    );
  }

  @autobind
  public refresh(): Promise<void> {
   return this.baseTableRef.current.refresh();
  }
}

