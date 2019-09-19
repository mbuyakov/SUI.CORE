import { lineFeedScreening } from '@smsoft/sui-core';
import Input from 'antd/lib/input';
import TextArea from 'antd/lib/input/TextArea';
import autobind from 'autobind-decorator';
import * as React from 'react';

import {DeletableSmallCard} from "../../../DeletableSmallCard";
import {IBaseDnDChildProps} from "../../../Draggable";
import {ISerializable, SerializableDnDChild} from "../../../Draggable/Serializable";
import {COMMON__GRID} from "../../../styles";

interface IChartSettingsState {
  field: string
  height: string
  js: string
}

export type SerializedChartSettings = ISerializable<IChartSettingsState>;

interface IChartSettingsProps extends IBaseDnDChildProps {
  plain?: SerializedChartSettings
}

export class ChartSettings extends SerializableDnDChild<SerializedChartSettings, IChartSettingsProps> {

  private readonly LAST_CHART_VERSION: number = 1;

  public constructor(props: IChartSettingsProps) {
    super(props);
    // console.log(props);
    if (this.isNew) {
      this.state = {
        ...this.state,
        field: '',
        height: '500',
        js: '',
      };
    }
  }

  public getCurrentVersion(): number {
    return this.LAST_CHART_VERSION;
  }

  public render(): JSX.Element {
    const isVersionNotLast = this.isVersionNotLast();

    return (
      <DeletableSmallCard
        draggable={this.props.draggable}
        onDelete={this.props.onDelete}
        title="График"
        isVersionNotLast={isVersionNotLast}
      >
        <div className={COMMON__GRID}>
          <span>Поле</span>
          <Input
            value={this.state.field}
            onChange={this.onFieldChanged}
          />
          <span>Высота</span>
          <Input
            value={this.state.height}
            onChange={this.onHeightChanged}
          />
          <span>Код</span>
          <TextArea
            autosize={{ minRows: 5, maxRows: 20 }}
            value={this.state.js}
            onChange={this.onJsChanged}
          />
        </div>
      </DeletableSmallCard>
    );
  }

  @autobind
  public toPlainObject(): SerializedChartSettings {
    return {
      ...this.state,
      js: lineFeedScreening(this.state.js),
    };
  }

  @autobind
  private onFieldChanged(e: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({ field: e.target.value });
  }

  @autobind
  private onHeightChanged(e: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({ height: e.target.value });
  }

  @autobind
  private onJsChanged(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    this.setState({ js: e.target.value });
  }
}
