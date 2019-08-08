import {Card, Divider} from "antd";
import * as React from "react";

interface ISeparatedRowProps {
  data: React.ReactNode[][];
  divider?: string | JSX.Element;
}

const defaultDivider = (<Divider type="vertical" style={{margin: 0, backgroundColor: "#888"}}/>);

export class SeparatedRow extends React.Component<ISeparatedRowProps> {

  public render(): JSX.Element {
    return (
      <Card
        bordered={false}
        bodyStyle={{
          display: "flex",
          flexWrap: "wrap",
          padding: 10
        }}
      >
        {(this.props.data || []).reduce((previousValue, currentValue, currentIndex) => {
          if (currentIndex !== 0) {
            previousValue.push(this.props.divider || defaultDivider);
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
