import {IObjectWithIndex, mutate} from "@sui/core";
import autobind from "autobind-decorator";
import React from "react";

// noinspection ES6PreferShortImport
import {errorNotification} from "../../drawUtils";

// noinspection ES6PreferShortImport
import {ICustomOdometerData} from "./CustomOdometer";
import {IOdometersProps, Odometers} from "./Odometers";

const refreshInterval = 5000; // ms

export type IWatchOdometersProps = Omit<IOdometersProps, "data"> & {
  mutationName: string;
  mutationParams: IObjectWithIndex;
  sectionName: string;
};

export interface IWatchOdometersState {
  data: IOdometersProps["data"];
}

export class WatchOdometers extends React.Component<IWatchOdometersProps, IWatchOdometersState> {

  private intervalId: NodeJS.Timeout;

  public constructor(props: IWatchOdometersProps) {
    super(props);
    this.state = {data: new Map()};
  }

  public async componentDidMount(): Promise<void> {
    return this.refreshInterval();
  }

  public async componentDidUpdate(prevProps: Readonly<IWatchOdometersProps>): Promise<void> {
    if (JSON.stringify(this.props.mutationParams) !== JSON.stringify(prevProps.mutationParams)) {
      await this.refreshInterval();
    }
  }

  public componentWillUnmount(): void {
    clearInterval(this.intervalId);
  }

  public render(): JSX.Element {
    return (
      <Odometers
        {...this.props}
        data={this.state.data}
      />
    );
  }

  @autobind
  private async refreshInterval(): Promise<void> {
    clearInterval(this.intervalId);
    await this.updateOdometerData();
    this.intervalId = setInterval(async () => {
      await this.updateOdometerData();
    }, refreshInterval);
  }

  @autobind
  private async updateOdometerData(): Promise<void> {
    return mutate<{ json: string }>(`mutation {
      ${this.props.mutationName}(
        input: ${JSON.stringify(this.props.mutationParams || {}).replace(/"([^"]+)":/g, "$1:")}
      ) {
        json
      }
    }`, true).then(value => {
      const data = new Map<string, ICustomOdometerData>();

      (JSON.parse(value.json || '[]') as IObjectWithIndex[]).forEach(element =>
        data.set(element.name, {current: element.current, difference: element.difference}));

      this.setState({data});
    }).catch(reason => errorNotification(
      `Ошибка при загрузки данных для раздела ${this.props.sectionName}`,
      reason.toString()
    ));
  }

}
