// tslint:disable:unnecessary-else
import { Icon as LegacyIcon } from '@ant-design/compatible';
import { Button, Dropdown, Menu, Modal } from 'antd';
import {ButtonGroupProps} from "antd/lib/button";
import {ModalFuncProps} from "antd/lib/modal";
import Popconfirm, {PopconfirmProps} from "antd/lib/popconfirm";
import Tooltip, { TooltipProps } from 'antd/lib/tooltip';
import autobind from "autobind-decorator";
import classNames from "classnames";
import * as React from "react";

import {INFO_MODAL_FIX, NO_BORDER_MODAL} from "../styles";
import {defaultIfNotBoolean} from "../typeWrappers";

import {TransitionGraph} from "./TransitionGraph";
import {IResolution, ITransition, ITransitionStatus, TransitionButtonProps} from "./types";

export interface ITransitionBarProps<TStatus extends ITransitionStatus<TID>, TID> {
  buttonGroupProps?: ButtonGroupProps;
  commonButtonProps?: TransitionButtonProps;
  currentId: TID;
  enableTransitionGraph?: boolean;
  graphTooltipProps?: TooltipProps;
  statuses: TStatus[];
  transitionGraphModalProps?: Omit<ModalFuncProps, "content">;
  transitions: Array<ITransition<TID>>;

  onTransit(toStatus: TStatus, resolution?: IResolution): Promise<void>;
  statusNameExtractor(status: TStatus): string;
}

interface ITransitionBarState {
  loading: boolean;
}

function hasPopconfirm(popconfirmProps?: PopconfirmProps): boolean {
  return !!(popconfirmProps && popconfirmProps.title);
}

function hasTooltip(tooltipProps?: TooltipProps): boolean {
  return !!(tooltipProps && tooltipProps.title);
}

function wrapInTooltip(
  element: string | JSX.Element,
  tooltipProps?: TooltipProps
): string | JSX.Element {
  return hasTooltip(tooltipProps)
    ? (
      <Tooltip
        {...tooltipProps}
      >
        {element}
      </Tooltip>
    ) : element;
}

function wrapInPopover(
  element: string | JSX.Element,
  popconfirmProps?: PopconfirmProps
): string | JSX.Element {
  return hasPopconfirm(popconfirmProps)
    ? (
      <Popconfirm
        {...popconfirmProps}
      >
        {element}
      </Popconfirm>
    ) : element;
}

const loadingIcon = (loading: boolean): JSX.Element => loading ? <span><LegacyIcon type="loading"/>&nbsp;</span> : null;

// TODO: Popconfirm for resolutions
export class TransitionBar<TStatus extends { id: TID }, TID = string>
  extends React.Component<ITransitionBarProps<TStatus, TID>, ITransitionBarState> {

  public constructor(props: ITransitionBarProps<TStatus, TID>) {
    super(props);
    this.state = {loading: false};
  }

  public render(): JSX.Element {
    const {
      buttonGroupProps,
      commonButtonProps = {},
      currentId,
      graphTooltipProps,
      transitions
    } = this.props;
    const commonLoading = this.state.loading || !!commonButtonProps.loading;
    const filteredTransitions = transitions.filter(transition => transition.fromId === currentId);
    const enableTransitionGraph = defaultIfNotBoolean(this.props.enableTransitionGraph, true);

    const graphButton = enableTransitionGraph && (
      <Button
        {...commonButtonProps}
        // disabled={commonLoading}
        onClick={this.showTransitionGraphModal}
      >
        <LegacyIcon type={commonLoading ? "loading" : "share-alt"}/>
      </Button>
    );

    return (
      <Button.Group
        {...buttonGroupProps}
        style={{display: 'flex', ...(buttonGroupProps && buttonGroupProps.style)}}
      >
        {filteredTransitions.map(transition => {
          const {
            fromId,
            toId,
            name,
            disabled: transitionDisabled,
            resolutions,
            tooltip,
            buttonProps = {},
            dropDownProps = {}
          } = transition;
          const key = `${String(fromId)}__${String(toId)}`;
          const loading = commonLoading || !!buttonProps.loading;
          const disabled = loading || !!transitionDisabled;
          const transitionContent = <>{loadingIcon(loading)}{name}</>;

          if (resolutions && resolutions.length) {
            const menu = (
              <Menu
                {...transition.menuProps}
                onClick={this.onDropdownMenuItemClickHandler(transition)}
              >
                {resolutions.map(resolution => {
                  const {
                    disabled: resolutionDisabled,
                    id,
                    menuItemProps,
                    name: resolutionName,
                    tooltip: resolutionTooltip
                  } = resolution;

                  return (
                    <Menu.Item
                      {...menuItemProps}
                      key={id}
                      disabled={resolutionDisabled || commonLoading}
                    >
                      {wrapInTooltip(resolutionName, resolutionTooltip)}
                    </Menu.Item>
                  );
                })}
              </Menu>
            );
            const content = <>{transitionContent} <LegacyIcon type="down"/></>;

            return (
              <Dropdown
                {...dropDownProps}
                key={key}
                overlay={menu}
                disabled={disabled || dropDownProps.disabled}
              >
                <Button
                  {...commonButtonProps}
                  {...buttonProps}
                  loading={false}
                  disabled={disabled}
                >
                  {wrapInTooltip(content, tooltip)}
                </Button>
              </Dropdown>
            );
          } else {
            const hasConfirm = hasPopconfirm(transition.popconfirmProps);
            const onClick = this.onTransitFn(transition);

            const result = (
              <Button
                {...commonButtonProps}
                {...buttonProps}
                loading={false}
                key={key}
                disabled={disabled}
                onClick={hasConfirm ? undefined : onClick}
              >
                {wrapInTooltip(transitionContent, tooltip)}
              </Button>
            );

            return wrapInPopover(
              result,
              hasConfirm && {
                ...transition.popconfirmProps,
                disabled: disabled || (transition.popconfirmProps && transition.popconfirmProps.disabled),
                onConfirm: onClick
              }
            );
          }
        })}
        {enableTransitionGraph && !!filteredTransitions.length && wrapInTooltip(graphButton, {title: "Граф возможных переходов", ...graphTooltipProps})}
      </Button.Group>
    );
  }

  @autobind
  private onDropdownMenuItemClickHandler(transition: ITransition<TID>): (event: { key: string }) => Promise<void> {
    return (event): Promise<void> => this.onTransitFn(transition, event.key)();
  }

  @autobind
  private onTransitFn(transition: ITransition<TID>, resolutionId?: string): () => Promise<void> {
    return async (): Promise<void> => {
      this.setState({loading: true});

      const toStatus = this.props.statuses.find(status => status.id === transition.toId);
      const resolution = resolutionId
        ? transition.resolutions.find(element => element.id === resolutionId)
        : undefined;

      return this.props.onTransit(toStatus, resolution)
        .finally(() => this.setState({loading: false}));
    }
  }

  @autobind
  private showTransitionGraphModal(): void {
    const {transitionGraphModalProps} = this.props;

    Modal.info({
      maskClosable: true,
      width: 1000,
      ...transitionGraphModalProps,
      className: classNames(
        INFO_MODAL_FIX,
        NO_BORDER_MODAL,
        transitionGraphModalProps ? transitionGraphModalProps.className : undefined
      ),
      content: (<TransitionGraph {...this.props}/>)
    })
  }

}
