import { Icon as LegacyIcon } from '@ant-design/compatible';
import {Button} from 'antd';
import Input from 'antd/es/input';
import Alert from 'antd/lib/alert';
import Popover from 'antd/lib/popover';
import Select, {OptionProps} from 'antd/lib/select';
import autobind from 'autobind-decorator';
import gql from 'graphql-tag';
import * as React from 'react';

import { mutate, query } from '../gql';
import { SUI_ROW_CONTAINER, SUI_ROW_GROW_LEFT, SUI_ROW_GROW_RIGHT } from '../styles';
import { IGraphQLConnection, IName } from '../types';
import { WaitData } from '../WaitData';

interface INamePopoverProps {
  id?: string;
  getPopupContainer(): HTMLElement;
  onChanged(newId: string): Promise<void> | void;
}

export class NamePopover extends React.Component<INamePopoverProps, {
  createMode?: boolean;
  description?: string;
  errorText?: string;
  name?: string;
  savingInProcess?: boolean;
  selectedNameId?: string;
  visible?: boolean;
}> {

  private static filterOption(inputValue: string, option: React.ReactElement<OptionProps>): boolean {
    return option.props.children.toString().toLowerCase().indexOf(inputValue.toLowerCase()) >= 0;
  }

  public constructor(props: INamePopoverProps) {
    super(props);
    this.state = {
      selectedNameId: this.props.id,
    };
  }

  public componentWillReceiveProps(nextProps: INamePopoverProps): void {
    this.setState({selectedNameId: nextProps.id});
  }

  public render(): JSX.Element {
    return (
      <Popover
        visible={this.state.visible}
        onVisibleChange={this.handleVisibleChange}
        title="Справочник имён"
        trigger="click"
        getPopupContainer={this.props.getPopupContainer}
        content={<div className={SUI_ROW_CONTAINER}>
          {this.state.errorText && <Alert
            message={this.state.errorText}
            type="error"
            showIcon={true}
          />}
          {this.state.createMode
            ? <>
              <Input
                placeholder="Введите имя"
                onChange={this.onNameChange}
                disabled={this.state.savingInProcess}
              />
              <Input
                placeholder="Введите описание"
                onChange={this.onDescriptionChange}
                disabled={this.state.savingInProcess}
              />
              <div className={SUI_ROW_GROW_RIGHT}>
                <Button
                  icon={<LegacyIcon type="arrow-left" />}
                  onClick={this.disableCreateMode}
                  disabled={this.state.savingInProcess}
                />
                <Button
                  type="primary"
                  onClick={this.onNewName}
                  disabled={!this.state.name}
                  loading={this.state.savingInProcess}
                >
                  Сохранить
                </Button>
              </div>
            </>
            : <>
              <WaitData
                query={`{
                  allNames {
                    nodes {
                      id
                      name
                      description
                    }
                  }
                }`}
                delay={0}
                alwaysUpdate={true}
                hideChildren={false}
              >
                {(data: { allNames: IGraphQLConnection<IName> }): JSX.Element => (
                  <div className={SUI_ROW_GROW_LEFT}>
                    <Select<string>
                      showSearch={true}
                      style={{width: '100%'}}
                      onSelect={this.onSelect}
                      value={data && this.state.selectedNameId}
                      disabled={this.state.savingInProcess}
                      filterOption={NamePopover.filterOption}
                      getPopupContainer={this.props.getPopupContainer}
                    >
                      {data && data.allNames.nodes
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(name => (
                          <Select.Option value={name.id}>{name.name}</Select.Option>
                        ))}
                    </Select>
                    <Button
                      disabled={!(data && this.state.selectedNameId)}
                      icon={<LegacyIcon type="close" />}
                      type="danger"
                      onClick={this.clearSelect}
                    />
                  </div>
                )}
              </WaitData>
              <Button
                type="primary"
                disabled={typeof this.state.selectedNameId === 'undefined' || this.state.selectedNameId === this.props.id}
                onClick={this.onSave}
                loading={this.state.savingInProcess}
              >
                Сохранить
              </Button>
              <Button
                type="dashed"
                onClick={this.enableCreateMode}
                disabled={this.state.savingInProcess}
              >
                Создать новое
              </Button>
            </>}
        </div>}
      >
        <Button
          type={!this.props.id ? 'primary' : 'default'}
        >
          {this.props.id ? 'Изменить' : 'Выбрать'}
        </Button>
      </Popover>
    );
  }

  @autobind
  private cleanAndClose(): void {
    this.setState({name: null, description: null, errorText: null, createMode: false, savingInProcess: false, visible: false});
  }

  @autobind
  private clearSelect(): void {
    this.setState({selectedNameId: null});
  }

  @autobind
  private disableCreateMode(): void {
    this.setState({createMode: false});
  }

  @autobind
  private enableCreateMode(): void {
    this.setState({createMode: true});
  }

  @autobind
  private handleVisibleChange(visible: boolean): void {
    this.setState({visible});
  }

  @autobind
  private onDescriptionChange(e: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({description: e.target.value});
  }

  @autobind
  private onNameChange(e: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({name: e.target.value});
  }

  @autobind
  private onNewName(): void {
    this.setState({savingInProcess: true, errorText: null});
    query<{ allNames: IGraphQLConnection<IName> }>(gql`{
      allNames(filter: {name: {equalTo: "${this.state.name.replace(/"/g, "\\\"")}"}}) {
        totalCount
      }
    }`)
      .then(value => {
        if (value.allNames.totalCount > 0) {
          // tslint:disable-next-line:no-string-throw
          throw 'Запись с таким именем уже существует';
        }
      })
      .then(() => mutate<{ createName: { name: { id: string } } }>(gql`mutation {
        createName(input: {name: {name: "${this.state.name.replace(/"/g, "\\\"")}", description: "${(this.state.description || '').replace(/ "/g, "\\\"")}"}}) {
          name {
            id
          }
        }
      }`))
      .then(value => value.createName.name.id)
      .then(newId => this.setState({selectedNameId: newId}, this.onSave))
      .catch(reason => this.setState({savingInProcess: false, errorText: reason.toString() || 'Ошибка при сохранении'}));
  }

  @autobind
  private onSave(): void {
    this.setState({savingInProcess: true, errorText: null});
    const promise = this.props.onChanged(this.state.selectedNameId);
    if (promise) {
      promise
        .then(this.cleanAndClose)
        .catch(reason => this.setState({savingInProcess: false, errorText: reason.toString() || 'Ошибка при сохранении'}));
    } else {
      this.cleanAndClose();
    }
  }

  @autobind
  private onSelect(data: string): void {
    this.setState({selectedNameId: data});
  }
}
