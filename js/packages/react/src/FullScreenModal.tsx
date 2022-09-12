import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import autobind from 'autobind-decorator';
import React from 'react';
import {sleep} from '@sui/core';
import {AppBar, Dialog, DialogProps, IconButton, Slide, Toolbar} from '@material-ui/core';
import {Theme, withStyles} from '@material-ui/core/styles';
import {TransitionProps} from '@material-ui/core/transitions';
import {ClassNameMap} from "@material-ui/styles";
import {AppBarElevator} from '@/Material';


type ChildrenWithPopupContainer = (getPopupContainer?: () => HTMLElement) => JSX.Element

const styles = (theme: Theme) => ({
  toolbar: {
    ...theme.mixins.toolbar
  },
  container: {
    overflow: "auto"
  }
});

const Transition = React.forwardRef((
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>,
) => {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface IFullScreenModalProps {
  classes?: ClassNameMap<'toolbar' | 'container'>,
  children: JSX.Element | ChildrenWithPopupContainer,
  defaultOpen?: boolean;
  dialogProps?: Omit<DialogProps, "children" | "fullScreen" | "open" | "onClose">;
  title: string | JSX.Element;
  withoutTransition?: boolean;

  onClose?(): void;
}

class FullScreenModalImpl extends React.Component<IFullScreenModalProps, {
  open?: boolean;
  containerRef?: HTMLElement;
}> {

  public constructor(props: IFullScreenModalProps) {
    super(props);
    this.state = {open: this.props.defaultOpen};
  }

  // eslint-disable-next-line react/no-unused-class-component-methods
  public open(): void {
    this.setState({open: true});
  }

  public render(): JSX.Element {

    return (
      <Dialog
        fullScreen={true}
        open={this.state.open || false}
        onClose={this.close}
        scroll="paper"
        TransitionComponent={this.props.withoutTransition ? undefined : Transition}
        {...this.props.dialogProps}
      >

        <AppBarElevator target={this.state.containerRef ?? undefined}>
          <AppBar>
            <Toolbar>
              <IconButton color="inherit" onClick={this.close} aria-label="Close">
                <CloseIcon/>
              </IconButton>
              <Typography variant="h6" color="inherit" style={{flex: 1}}>
                {this.props.title}
              </Typography>
            </Toolbar>
          </AppBar>
        </AppBarElevator>
        <div className={this.props.classes.toolbar}/>
        <div
          className={this.props.classes.container}
          ref={containerRef => !this.state.containerRef && this.setState({containerRef})}>
          {
            typeof (this.props.children) === "function"
              ? this.props.children(this.getPopupContainer)
              : this.props.children
          }
        </div>
      </Dialog>
    );
  }

  @autobind
  private getPopupContainer(): HTMLElement {
    return this.state.containerRef;
  }

  @autobind
  public close(): void {
    this.setState({open: false});
    sleep(500).then(() => {
      if (this.props.onClose) {
        this.props.onClose();
      }
    });
  }

}

export type FullScreenModalClass = FullScreenModalImpl;
export const FullScreenModal = withStyles(styles)(FullScreenModalImpl);
