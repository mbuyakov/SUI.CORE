/* tslint:disable:member-ordering jsx-no-lambda */
import {PlusCircleOutlined} from "@ant-design/icons";
import {wrapInArray} from "@sui/ui-old-core";
import {Button, ButtonProps, Card, CardProps, Form, FormItemProps, Space} from "@sui/deps-antd";
import React from "react";
import {DnfActions} from "@/Dnf/DnfActions";
import {FormListProps, NamePath} from "@/antdMissedExport";

export interface IRowCreatorMeta {
  formItemNameGenerator(field: NamePath): NamePath;

  formItemFieldKeyGenerator(field: NamePath): NamePath;

  internalNamePathGenerator(field?: NamePath): NamePath;
}

export interface IDnfFormProps {
  andListProps: Omit<FormListProps, "children">;
  orListProps: Omit<FormListProps, "children">;
  addConjunctionButtonProps?: Omit<ButtonProps, "onClick">;
  addConjunctionButtonTitle?: string;
  addDisjunctionButtonProps?: Omit<ButtonProps, "onClick">;
  addDisjunctionButtonTitle?: string;
  andDivider?: React.JSX.Element;
  orDivider?: React.JSX.Element;
  allowClear?: boolean;
  disableRowSwap?: boolean;
  gap?: number;
  andCardProps?: CardProps;
  addDisjunctionFormItemProps?: FormItemProps;

  rowCreator(meta: IRowCreatorMeta): React.JSX.Element;
}

export class DnfForm extends React.Component<IDnfFormProps> {

  // tslint:disable-next-line:typedef
  public static DEFAULT_GAP = 8;

  public render(): React.JSX.Element {
    const gap = this.props.gap || DnfForm.DEFAULT_GAP;

    return (
      <Form.List {...this.props.orListProps}>
        {(orFields, orOperations, {errors: orErrors}): JSX.Element => {
          const disableOrSwap = this.props.disableRowSwap || orFields.length <= 1;

          return (
            <Space
              direction="vertical"
              style={{width: "100%"}}
              size={gap}
            >
              {orFields.map((orField, orIndex) => (
                <>
                  {orIndex !== 0 && this.props.orDivider}
                  <Space
                    key={orField.key}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr max-content",
                    }}
                    size={gap}
                  >
                    <Card
                      {...this.props.andCardProps}
                      bodyStyle={{
                        padding: gap,
                        ...this.props.andCardProps?.bodyStyle
                      }}
                    >
                      <Form.List
                        {...this.props.andListProps}
                        name={[orField.name, this.props.andListProps.name as string]}
                      >
                        {(andFields, andOperations, {errors: andErrors}): JSX.Element => {
                          const disableAndSwap = this.props.disableRowSwap || andFields.length <= 1;

                          return (
                            <Space
                              direction="vertical"
                              style={{width: "100%"}}
                              size={gap}
                            >
                              {andFields.map((andField, andIndex) => (
                                <>
                                  {andIndex !== 0 && this.props.andDivider}
                                  <Space
                                    key={andField.key}
                                    style={{
                                      display: "grid",
                                      gridTemplateColumns: "1fr max-content",
                                      alignItems: "baseline"
                                    }}
                                    size={gap}
                                  >
                                    <Space
                                      style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr"
                                      }}
                                      size={gap}
                                    >
                                      {this.props.rowCreator({
                                        formItemNameGenerator: (field: NamePath): NamePath => [andField.name, ...wrapInArray(field)],
                                        formItemFieldKeyGenerator: (field: NamePath): NamePath => [andField.fieldKey, ...wrapInArray(field)],
                                        internalNamePathGenerator: (field: NamePath): NamePath => [
                                          this.props.orListProps.name as string,
                                          orIndex,
                                          this.props.andListProps.name as string,
                                          andIndex,
                                          ...(field != null ? wrapInArray(field) : [])
                                        ],
                                      })}
                                    </Space>
                                    <DnfActions
                                      upButtonProps={{
                                        disabled: andIndex === 0,
                                        style: {display: disableAndSwap ? "none !important" : undefined}
                                      }}
                                      removeButtonProps={{disabled: andFields.length === 1}}
                                      downButtonProps={{
                                        disabled: andIndex === andFields.length - 1,
                                        style: {display: disableAndSwap ? "none !important" : undefined,}
                                      }}
                                      onUp={(): void => andOperations.move(andIndex, andIndex - 1)}
                                      onRemove={(): void => andOperations.remove(andIndex)}
                                      onDown={(): void => andOperations.move(andIndex, andIndex + 1)}
                                    />
                                  </Space>
                                </>
                              ))}
                              <Form.ErrorList errors={andErrors}/>
                              <Form.Item style={{marginBottom: 0}}>
                                <Button
                                  htmlType="button"
                                  type="dashed"
                                  {...this.props.addConjunctionButtonProps}
                                  style={{
                                    width: "100%",
                                    ...this.props.addConjunctionButtonProps?.style
                                  }}
                                  onClick={(): void => andOperations.add()}
                                >
                                  <PlusCircleOutlined/> {this.props.addConjunctionButtonTitle || "Добавить Конъюнкцию"}
                                </Button>
                              </Form.Item>
                            </Space>
                          );
                        }}
                      </Form.List>
                    </Card>
                    {/* OR block actions */}
                    <DnfActions
                      buttonGroupProps={{
                        style: {
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center"
                        }
                      }}
                      upButtonProps={{
                        disabled: orIndex === 0,
                        style: {display: disableOrSwap ? "none !important" : undefined}
                      }}
                      removeButtonProps={{
                        disabled: (orFields.length === 1 && !this.props.allowClear),
                        style: {marginLeft: 0, marginTop: -1}
                      }}
                      downButtonProps={{
                        disabled: orIndex === orFields.length - 1,
                        style: {
                          display: disableOrSwap ? "none !important" : undefined,
                          marginLeft: 0,
                          marginTop: -1
                        }
                      }}
                      onUp={(): void => orOperations.move(orIndex, orIndex - 1)}
                      onRemove={(): void => orOperations.remove(orIndex)}
                      onDown={(): void => orOperations.move(orIndex, orIndex + 1)}
                    />
                  </Space>
                </>
              ))}
              <Form.ErrorList errors={orErrors}/>
              <Form.Item {...this.props.addDisjunctionFormItemProps}>
                <Button
                  htmlType="button"
                  type="dashed"
                  {...this.props.addDisjunctionButtonProps}
                  style={{
                    width: "100%",
                    ...this.props.addDisjunctionButtonProps?.style
                  }}
                  onClick={(): void => orOperations.add({[this.props.andListProps.name as string]: [{}]})}
                >
                  <PlusCircleOutlined/> {this.props.addDisjunctionButtonTitle || "Добавить Дизъюнкцию"}
                </Button>
              </Form.Item>
            </Space>
          );
        }}
      </Form.List>
    );
  }

}
