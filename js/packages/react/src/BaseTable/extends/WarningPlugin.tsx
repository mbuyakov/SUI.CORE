import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Warning from '@material-ui/icons/Warning';
import {Popover} from "antd";
import Divider from "antd/lib/divider";
import autobind from "autobind-decorator";
import React from 'react';

// noinspection ES6PreferShortImport
import {YELLOW_BLINK} from "../../styles";

export interface IWarningPluginProps {
  messages?: Array<JSX.Element | string>
}

export class WarningPlugin extends React.Component<IWarningPluginProps, {
  popoverOpened?: boolean;
}> {

  public constructor(props: IWarningPluginProps) {
    super(props);
    this.state = {};
  }

  public render(): React.ReactNode {
    if (!this.props.messages || this.props.messages.length === 0) {
      return null;
    }

    const button = (
      <IconButton style={{marginLeft: -12, marginRight: 8}} onClick={this.openPopover}>
        <Warning fontSize="large" className={YELLOW_BLINK}/>
      </IconButton>
    );

    return (
      <>
        <Popover
          title="Список ошибок"
          trigger="click"
          visible={this.state.popoverOpened}
          onVisibleChange={this.onVisibleChange}
          placement="bottom"
          content={<ul style={{paddingLeft: 16}}>
            {this.props.messages.map(msg => (<li>{msg}</li>))}
          </ul>}
        >
          {this.state.popoverOpened
            ? button
            : (
              <Tooltip
                title='Предупреждения'
                placement='bottom'
                enterDelay={300}
              >
                {button}
              </Tooltip>
            )}
        </Popover>
        <Divider
          type="vertical"
          style={{
            height: 40,
            marginLeft: -4
          }}
        />
      </>
    );
  }

  @autobind
  private onVisibleChange(visible: boolean): void {
    if (visible) {
      return;
    }
    this.setState({popoverOpened: false});
  }

  @autobind
  private openPopover(): void {
    this.setState({popoverOpened: true});
  }

}
