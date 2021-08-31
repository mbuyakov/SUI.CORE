import {Collapse, CollapseProps, withStyles} from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Dialog, {DialogProps} from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import autobind from 'autobind-decorator';
import React from 'react';
import {v4 as uuidv4} from 'uuid';
import {sleep} from '@sui/core';

import {Z_999} from './styles';

type ChildrenWithPopupContainer = (getPopupContainer?: () => HTMLElement) => JSX.Element

function Transition(props: CollapseProps): JSX.Element {
  return <Collapse {...props}/>;
}

interface IFullScreenModalProps {
  children: JSX.Element | ChildrenWithPopupContainer,
  defaultOpen?: boolean;
  dialogProps?: Omit<DialogProps, "children" | "fullScreen" | "open" | "onClose">;
  title: string | JSX.Element;
  withoutTransition?: boolean;

  onClose?(): void;
}

class FullScreenDialogImpl extends React.Component<IFullScreenModalProps, {
  open?: boolean;
}> {

  private readonly id: string;

  public constructor(props: IFullScreenModalProps) {
    super(props);
    this.state = {open: this.props.defaultOpen};
    this.id = uuidv4();
  }

  public open(): void {
    this.setState({open: true});
  }

  public render(): JSX.Element {
    return (
      <Dialog
        classes={{root: Z_999}}
        fullScreen={true}
        open={this.state.open || false}
        onClose={this.handleClose}
        TransitionComponent={this.props.withoutTransition ? undefined : Transition}
        {...this.props.dialogProps}
      >
        <div id={this.id} style={{maxHeight: '100%'}}>
          <AppBar className="appBar" style={{zIndex: 1000, position: "relative"}}>
            <Toolbar>
              <IconButton color="inherit" onClick={this.handleClose} aria-label="Close">
                <CloseIcon/>
              </IconButton>
              <Typography variant="h6" color="inherit" style={{flex: 1}}>
                {this.props.title}
              </Typography>
            </Toolbar>
          </AppBar>
          <div
            style={{
              maxHeight: 'calc(100vh - 64px)',
              minHeight: 'calc(100vh - 64px)',
              overflowY: 'auto'
            }}
          >
            {
              typeof (this.props.children) === "function"
                ? this.props.children(this.getPopupContainer)
                : this.props.children
            }
          </div>
        </div>
      </Dialog>
    );
  }

  @autobind
  private getPopupContainer(): HTMLElement {
    return document.getElementById(this.id);
  }

  @autobind
  public handleClose(): void {
    this.setState({open: false});
    sleep(500).then(() => {
      if (this.props.onClose) {
        this.props.onClose();
      }
    });
  }

}

const FullScreenDialogImplWithStyles = withStyles({})(FullScreenDialogImpl);

export class FullScreenModal extends React.Component<IFullScreenModalProps> {

  private readonly innerRef: React.RefObject<FullScreenDialogImpl> = React.createRef<FullScreenDialogImpl>();

  public open(): void {
    if (this.innerRef.current) {
      this.innerRef.current.open();
    }
  }

  public close(): void {
    if (this.innerRef.current) {
      this.innerRef.current.handleClose();
    }
  }

  public render(): JSX.Element {
    return (
      <FullScreenDialogImplWithStyles
        innerRef={this.innerRef}
        {...this.props}
      />
    );
  }

}
