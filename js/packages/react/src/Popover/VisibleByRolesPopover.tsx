import {SUI_ROW_CONTAINER, SUI_ROW_GROW_LEFT} from '@/styles';
import {UsergroupAddOutlined} from '@ant-design/icons';
import {IColumnInfo, IColumnInfoRole, IRole, mutate} from '@sui/core';
import {Popover} from 'antd';
import Button from 'antd/lib/button';
import Divider from 'antd/lib/divider';
import Select from 'antd/lib/select';
import autobind from 'autobind-decorator';
import * as React from 'react';

import {PromisedButton, PromisedSwitch} from '../Inputs';

export interface IVisibleByRolesPopoverProps {
  columnInfo?: IColumnInfo;
  roles: IRole[];

  afterRolesPromise(roles: IColumnInfoRole[]): Promise<void>;

  getPopupContainer(): HTMLElement;

  visiblePromise(visible: boolean): Promise<void>;
}

export class VisibleByRolesPopover extends React.Component<IVisibleByRolesPopoverProps, {
  popoverVisible?: boolean;
  savingInProcess?: boolean;
  selectedRoles?: string[];
  selectOpened?: boolean;
}> {
  private readonly saveButtonRef: React.RefObject<PromisedButton> = React.createRef<PromisedButton>();

  public constructor(props: IVisibleByRolesPopoverProps) {
    super(props);
    this.state = {};
  }

  @autobind
  public async generateSavePromise(): Promise<void> {
    this.setState({ savingInProcess: true });

    return Promise.all(this.props.columnInfo.columnInfoRolesByColumnInfoId.nodes.map((columnInfoRole: IColumnInfoRole) => mutate(`mutation {
      deleteColumnInfoRoleById(input: {id: "${columnInfoRole.id}"}) {
        clientMutationId
      }
    }`)))
      .then(() => Promise.all(this.state.selectedRoles.map(roleId =>
        mutate<{ columnInfoRole: IColumnInfoRole }>(`mutation {
          createColumnInfoRole(input: {columnInfoRole: {columnInfoId: "${this.props.columnInfo.id}", roleId: "${roleId}"}}) {
            columnInfoRole {
              id
              roleId
            }
          }
        }`, true))))
      .then(async columnInfoRoles => {
        this.setState({ savingInProcess: false, popoverVisible: false, selectedRoles: null });

        return this.props.afterRolesPromise(columnInfoRoles.map(val => val.columnInfoRole));
      });
  }

  @autobind
  public onPopoverVisibleChange(value: boolean): void {
    if (value) {
      // Ignore
      return;
    }
    this.setState({ popoverVisible: value });
  }

  @autobind
  public onRolesChanged(value: string[]): void {
    this.setState({ selectedRoles: value || [] });
  }

  @autobind
  public openPopover(): void {
    this.setState({ popoverVisible: true });
  }

  public render(): JSX.Element {
    return (
      <div className={SUI_ROW_GROW_LEFT}>
        <PromisedSwitch
          defaultChecked={this.props.columnInfo.visible}
          promise={this.props.visiblePromise}
        />
        <Popover
          title="Выбор ролей"
          trigger="click"
          visible={this.state.popoverVisible}
          onVisibleChange={this.onPopoverVisibleChange}
          getPopupContainer={this.props.getPopupContainer}
          content={
            <div className={SUI_ROW_CONTAINER}>
              <Select
                mode='multiple'
                value={this.state.selectedRoles || this.props.columnInfo.columnInfoRolesByColumnInfoId.nodes.map(value => value.roleId)}
                open={this.state.selectOpened}
                onDropdownVisibleChange={this.onDropdownVisibleChange}
                onChange={this.onRolesChanged}
                disabled={this.state.savingInProcess}
                loading={this.state.savingInProcess}
                dropdownRender={this.dropdownRender}
                getPopupContainer={this.props.getPopupContainer}
              >
                {this.props.roles
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(role => (
                    <Select.Option value={role.id.toString()}>{role.name}</Select.Option>
                  ))}
              </Select>
              <PromisedButton
                ref={this.saveButtonRef}
                style={{ width: '100%' }}
                promise={this.generateSavePromise}
                disabled={!this.state.selectedRoles}
                type="primary"
              >
                Сохранить
              </PromisedButton>
            </div>}
        >
          <Button
            style={!(this.state.selectedRoles || this.props.columnInfo.columnInfoRolesByColumnInfoId.nodes.length > 0) ? { color: '#f5f5f5', backgroundColor: '#f5222d' } : {}}
            icon={<UsergroupAddOutlined/>}
            onClick={this.openPopover}
          />
        </Popover>
      </div>
    );
  }

  @autobind
  private dropdownRender(menu: React.ReactNode): JSX.Element {
    return (
      <div>
        {menu}
        <Divider style={{ margin: '4px 0' }}/>
        <div style={{ padding: 8, paddingTop: 4 }}>
          <Button
            onMouseDown={this.onMouseDown}
            block={true}
            disabled={!this.state.selectedRoles}
            type="primary"
          >
            Сохранить
          </Button>
        </div>
      </div>
    );
  }

  @autobind
  private onDropdownVisibleChange(open: boolean): void {
    this.setState({ selectOpened: open });
  }

  @autobind
  private onMouseDown(): void {
    this.saveButtonRef.current.save();
    this.onDropdownVisibleChange(false);
  }
}
