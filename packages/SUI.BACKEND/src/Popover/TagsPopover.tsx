import { mutate, query, SUI_ROW_CONTAINER, SUI_ROW_GROW_LEFT, SUI_ROW_GROW_RIGHT } from '@smsoft/sui-core';
import { IColumnInfoTag, IGraphQLConnection, ITag } from '@smsoft/sui-meta';
import { WaitData } from '@smsoft/sui-promised';
import { Button } from 'antd';
import Input from 'antd/es/input';
import Alert from 'antd/lib/alert';
import Popover from 'antd/lib/popover';
import Select, { OptionProps } from 'antd/lib/select';
import autobind from 'autobind-decorator';
import * as React from 'react';

export interface ITagsPopoverProps {
  colTagsConnection?: IGraphQLConnection<IColumnInfoTag>;

  getPopupContainer(): HTMLElement;

  onChanged(newIds: string[]): Promise<void> | void;
}

export class TagsPopover extends React.Component<ITagsPopoverProps, {
  code?: string;
  createMode?: boolean;
  errorText?: string;
  name?: string;
  savingInProcess?: boolean;
  selectedTags?: string[];
  visible?: boolean;
}> {

  private static filterOption(inputValue: string, option: React.ReactElement<OptionProps>): boolean {
    return option.props.children.toString().toLowerCase().indexOf(inputValue.toLowerCase()) >= 0;
  }

  public constructor(props: ITagsPopoverProps) {
    super(props);
    this.state = {
      selectedTags: this.props.colTagsConnection.nodes.map(con => con.tagByTagId.id),
    };
  }

  public componentWillReceiveProps(nextProps: ITagsPopoverProps): void {
    this.setState({ selectedTags: nextProps.colTagsConnection.nodes.map(con => con.tagByTagId.id) });
  }

  public render(): JSX.Element {
    return (
      <Popover
        visible={this.state.visible}
        onVisibleChange={this.handleVisibleChange}
        title="Справочник тегов"
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
                placeholder="Введите код"
                onChange={this.onCodeChange}
                disabled={this.state.savingInProcess}
              />
              <Input
                placeholder="Введите имя"
                onChange={this.onNameChange}
                disabled={this.state.savingInProcess}
              />
              <div className={SUI_ROW_GROW_RIGHT}>
                <Button
                  icon="arrow-left"
                  onClick={this.disableCreateMode}
                  disabled={this.state.savingInProcess}
                />
                <Button
                  type="primary"
                  onClick={this.onNewTag}
                  disabled={!this.state.code}
                  loading={this.state.savingInProcess}
                >
                  Сохранить
                </Button>
              </div>
            </>
            : <>
              <WaitData<IGraphQLConnection<ITag>>
                query={`{
                  allTags {
                    nodes {
                      id
                      code
                      name
                    }
                  }
                }`}
                extractFirstKey={true}
                delay={0}
                alwaysUpdate={true}
                hideChildren={false}
              >
                {(data): JSX.Element => (
                  <div className={SUI_ROW_GROW_LEFT}>
                    <Select<string[]>
                      mode="multiple"
                      showSearch={true}
                      style={{ width: '100%' }}
                      onChange={this.onChange}
                      value={data && this.state.selectedTags}
                      disabled={this.state.savingInProcess}
                      filterOption={TagsPopover.filterOption}
                      getPopupContainer={this.props.getPopupContainer}
                    >
                      {data && data.nodes
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(tag => (
                          <Select.Option value={tag.id}>{tag.code} ({tag.name})</Select.Option>
                        ))}
                    </Select>
                    <Button
                      disabled={!(data && this.state.selectedTags && this.state.selectedTags.length > 0)}
                      icon="close"
                      type="danger"
                      onClick={this.clearSelect}
                    />
                  </div>
                )}
              </WaitData>
              <Button
                type="primary"
                disabled={
                  typeof this.state.selectedTags === 'undefined'
                  || (
                    this.state.selectedTags.length === this.props.colTagsConnection.nodes.length &&
                    this.state.selectedTags.every(value => this.props.colTagsConnection.nodes.map(con => con.tagByTagId.id).includes(value))
                  )
                }
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
          type={!(this.props.colTagsConnection.nodes.length > 0) ? 'primary' : 'default'}
        >
          {(this.props.colTagsConnection.nodes.length > 0) ? 'Изменить' : 'Выбрать'}
        </Button>
      </Popover>
    );
  }

  @autobind
  private cleanAndClose(): void {
    this.setState({ code: null, name: null, errorText: null, createMode: false, savingInProcess: false, visible: false });
  }

  @autobind
  private clearSelect(): void {
    this.setState({ selectedTags: [] });
  }

  @autobind
  private disableCreateMode(): void {
    this.setState({ createMode: false });
  }

  @autobind
  private enableCreateMode(): void {
    this.setState({ createMode: true });
  }

  @autobind
  private handleVisibleChange(visible: boolean): void {
    this.setState({ visible });
  }

  @autobind
  private onChange(data: string[]): void {
    this.setState({ selectedTags: data });
  }

  @autobind
  private onCodeChange(e: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({ code: e.target.value });
  }

  @autobind
  private onNameChange(e: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({ name: e.target.value });
  }

  @autobind
  private onNewTag(): void {
    this.setState({ savingInProcess: true, errorText: null });
    query<IGraphQLConnection<ITag>>(`{
      allTags(filter: {code: {equalTo: "${this.state.code.replace(/"/g, '\\"')}"}}) {
        totalCount
      }
    }`, true)
      .then(value => {
        if (value.totalCount > 0) {
          // tslint:disable-next-line:no-string-throw
          throw 'Запись с таким кодом уже существует';
        }
      })
      .then(_ => mutate<{ createTag: { tag: { id: string } } }>(`mutation {
        createTag(input: {tag: {code: "${this.state.code.replace(/"/g, '\\"')}", name: "${(this.state.name || '').replace(/"/g, '\\"')}"}}) {
          tag {
            id
          }
        }
      }`))
      .then(value => value.createTag.tag.id)
      .then(newId => this.setState({
        code: null,
        createMode: false,
        errorText: null,
        name: null,
        savingInProcess: false,
        selectedTags: [...this.state.selectedTags, newId],
      }))
      .catch(reason => this.setState({ savingInProcess: false, errorText: reason.toString() || 'Ошибка при сохранении' }));
  }

  @autobind
  private onSave(): void {
    this.setState({ savingInProcess: true, errorText: null });
    const promise = this.props.onChanged(this.state.selectedTags);
    if (promise) {
      promise
        .then(this.cleanAndClose)
        .catch(reason => this.setState({ savingInProcess: false, errorText: reason.toString() || 'Ошибка при сохранении' }));
    } else {
      this.cleanAndClose();
    }
  }
}
