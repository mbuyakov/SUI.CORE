import {Card, Divider} from "@sui/deps-antd";
import * as React from "react";

interface ISeparatedRowProps {
  data: React.ReactNode[][];
  divider?: string | JSX.Element;

  customDivider?(index: number, prevNode: React.ReactNode, nextNode: React.ReactNode): JSX.Element | string;
}

const defaultDivider = (<Divider type="vertical" style={{margin: 0, backgroundColor: "#888"}}/>);

export class SeparatedRow extends React.Component<ISeparatedRowProps> {

  public render(): JSX.Element {
    const data = this.props.data;

    return (
      <Card
        bodyStyle={{
          display: "flex",
          flexWrap: "wrap",
          padding: 10
        }}
      >
        {(data || []).reduce((previousValue, currentValue, currentIndex) => {
          let divider = this.props.customDivider && this.props.customDivider(
            currentIndex,
            (currentIndex ? data[currentIndex - 1] : undefined),
            currentValue
          );

          if (currentIndex !== 0) {
            divider = divider || this.props.divider || defaultDivider;
          }

          if (divider) {
            previousValue.push(divider);
          }
          currentValue.forEach(element => previousValue.push(element));

          return previousValue;
        }, []).map(element => (
          <span
            style={{padding: "0 5px", whiteSpace: "nowrap"}}
          >
            {element}
          </span>
        ))}
      </Card>
    );
  }

}
