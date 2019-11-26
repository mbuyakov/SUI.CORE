/* tslint:disable:no-return-await */
import autobind from "autobind-decorator";
import React from "react";

import {ColumnInfo, TableInfoManager} from "../cache";
import {asyncMap, groupBy, IObjectWithIndex, toMap} from "../other";
import {camelCase} from "../stringFormatters";
import {IRole} from "../types";
import {formatRoleName, getDataSet, getDataSetRender, getUser} from "../utils";

import {ITransitionBarProps, TransitionBar} from "./TransitionBar";
import {ITransition, ITransitionStatus} from "./types";
import {fetchAllRows, fetchJoinTable, findColumnByReferencedTable} from "./utils";

const ROLE_TABLE_NAME = "roles";
const NAME_FIELD = "__name";
const ACTION_FIELD = "__ACTION";
const FROM_STATUS_FIELD = "__FROM_STATUS";
const TO_STATUS_FIELD = "__TO_STATUS";
const RESOLUTION_FIELD = "__RESOLUTION";

function equalOrStartWithFilter(equal: string | null | undefined, startsWith: string): (column: ColumnInfo) => boolean {
  return (column): boolean => equal
    ? column.columnName === equal
    : column.columnName.startsWith(startsWith);
}

export interface IMetaTransitionBarProps<TStatus extends ITransitionStatus<TID>, TAction, TResolution, TID = string>
  extends Omit<ITransitionBarProps<TStatus, TID>, "statuses" | "transitions" | "statusNameExtractor"> {
  actionResolutionJoinTableName?: string;
  actionRoleJoinTableName?: string;
  actionStatusJoinTableName?: string;
  actionTableName: string;
  disableRoleRestrictions?: boolean;
  fromStatusColumnName?: string;
  resolutionTableName?: string;
  statusTableName: string;
  toStatusColumnName?: string;
  transitionFormatter?(
    transition: ITransition<TID>,
    fromStatus: TStatus,
    toStatus: TStatus,
    action: TAction,
    resolutions: TResolution[]
  ): ITransition<TID> | null;
}

export interface IMetaTransitionBarState<TStatus, TID = string> {
  statuses: TStatus[];
  transitions: Array<ITransition<TID>>;
}

export class MetaTransitionBar<TStatus extends ITransitionStatus<TID>, TAction = IObjectWithIndex, TResolution = IObjectWithIndex, TID = string>
  extends React.Component<IMetaTransitionBarProps<TStatus, TAction, TResolution, TID>, IMetaTransitionBarState<TStatus, TID>> {

  public constructor(props: IMetaTransitionBarProps<TStatus, TAction, TResolution, TID>) {
    super(props);
    this.state = {
      statuses: [],
      transitions: [],
    };
  }

  public async componentDidMount(): Promise<void> {
    const {
      actionTableName,
      resolutionTableName,
      statusTableName,
      actionResolutionJoinTableName,
      actionRoleJoinTableName,
      actionStatusJoinTableName,
      disableRoleRestrictions,
      fromStatusColumnName,
      toStatusColumnName
    } = this.props;

    // fetch main tables
    const [
      actionTable,
      resolutionTable,
      statusTable,
      roleTable
    ] = await asyncMap(
      [
        actionTableName,
        resolutionTableName,
        statusTableName,
        ROLE_TABLE_NAME
      ],
      async tableName => tableName ? await TableInfoManager.getById(tableName) : undefined
    );

    // fetch join tables
    const [
      actionStatusTable,
      actionResolutionTable,
      actionRoleTable
    ] = await asyncMap(
      [
        actionStatusJoinTableName || {first: actionTable, second: statusTable},
        actionResolutionJoinTableName || {first: actionTable, second: resolutionTable},
        !disableRoleRestrictions ? (actionRoleJoinTableName || {first: actionTable, second: roleTable}) : undefined
      ],
      async tableName => tableName ? await fetchJoinTable(tableName) : undefined
    );

    // fetch join data
    const [
      actions,
      resolutions,
      badTypeStatuses,
      roles,
      actionStatuses,
      actionResolutions,
      actionRoles
    ] = await asyncMap(
      [
        actionTable,
        resolutionTable,
        statusTable,
        roleTable,
        actionStatusTable,
        actionResolutionTable,
        actionRoleTable,
      ],
      async table => table ? await fetchAllRows(table) : undefined
    );
    const statuses = badTypeStatuses as unknown as TStatus[];
    const currentUserRoles = getUser().roles;

    // fetch renderColumns
    const renderSettings = [
      {elements: actions, table: actionTable},
      {elements: resolutions, table: resolutionTable},
      {elements: statuses, table: statusTable}
    ];

    for (const item of renderSettings) {
      if (item.table && (item.elements && item.elements.length)) {
        const dataSetMap = toMap(await getDataSet(currentUserRoles, item.table), element => element.id);
        item.elements.forEach(element => element[NAME_FIELD] = getDataSetRender(dataSetMap.get(element.id)))
      }
    }

    // Fetch reference columns
    const [
      actionStatusActionId,
      actionStatusFromStatusId,
      actionStatusToStatusId,
      actionResolutionActionId,
      actionResolutionResolutionId,
      actionRoleActionId,
      actionRoleRoleId
    ] = await asyncMap(
      [
        {baseTable: actionStatusTable, refTable: actionTable},
        {
          baseTable: actionStatusTable,
          filter: equalOrStartWithFilter(fromStatusColumnName, "from"),
          refTable: statusTable
        },
        {
          baseTable: actionStatusTable,
          filter: equalOrStartWithFilter(toStatusColumnName, "to"),
          refTable: statusTable
        },
        {baseTable: actionResolutionTable, refTable: actionTable},
        {baseTable: actionResolutionTable, refTable: resolutionTable},
        {baseTable: actionRoleTable, refTable: actionTable},
        {baseTable: actionRoleTable, refTable: roleTable}
      ],
      async item => {
        const column = await findColumnByReferencedTable(item.baseTable, item.refTable, item.filter);

        return column ? camelCase(column.columnName) : undefined;
      }
    );

    const actionMap = toMap(actions, action => action.id);
    const resolutionMap = toMap(resolutions || [], resolution => resolution.id);
    const roleMap = toMap((roles as IRole[]), role => role.id);
    const statusMap = toMap(statuses, status => status.id);

    const actionResolutionsMap = groupBy(
      actionResolutions || [],
      element => element[actionResolutionActionId]
    );
    const actionRoleMap = groupBy(
      actionRoles || [],
      element => element[actionRoleActionId]
    );

    const transitions: Array<ITransition<TID>> = [];

    // Generate transitions
    actionStatuses.forEach(actionStatus => {
      const action = actionMap.get(actionStatus[actionStatusActionId]);
      const currentActionResolutions = actionResolutionsMap.get(action.id) || [];
      let isAllowed = true;

      if (actionRoleTable) {
        // TODO: не тестил, так как не было примера (Выглядит валидно)
        isAllowed = (actionRoleMap.get(action.id) || [])
          .map(actionRole => roleMap.get(actionRole[actionRoleRoleId]))
          .map(role => formatRoleName(role.name))
          .some(roleName => currentUserRoles.includes(roleName));
      }

      if (isAllowed) {
        const [fromId, toId] = [actionStatusFromStatusId, actionStatusToStatusId].map(field => actionStatus[field]);

        // tslint:disable-next-line:no-object-literal-type-assertion
        transitions.push({
          fromId,
          name: action[NAME_FIELD],
          resolutions: currentActionResolutions.length
            ? currentActionResolutions
              .map(actionResolution => resolutionMap.get(actionResolution[actionResolutionResolutionId]))
              .filter(Boolean)
              .map(resolution => ({
                id: resolution.id,
                name: resolution[NAME_FIELD],
                [RESOLUTION_FIELD]: resolution
              }))
            : undefined,
          toId,
          [ACTION_FIELD]: action,
          [FROM_STATUS_FIELD]: statusMap.get(fromId),
          [TO_STATUS_FIELD]: statusMap.get(toId),
        } as ITransition<TID>);
      }
    });

    this.setState({
      statuses,
      transitions
    });
  }

  public render(): JSX.Element {
    const {transitionFormatter, ...barProps} = this.props;
    const transitions = this.state.transitions;

    // Note: transitionFormatter can return null (Then transition will be excluded)
    if (transitionFormatter) {
      transitions.forEach((transition, index) => {
        const noTypeTransition = transition as IObjectWithIndex;

        transitions[index] = transitionFormatter(
          transition,
          noTypeTransition[FROM_STATUS_FIELD],
          noTypeTransition[TO_STATUS_FIELD],
          noTypeTransition[ACTION_FIELD],
          transition.resolutions ? transition.resolutions.map(resolution => (resolution as IObjectWithIndex)[RESOLUTION_FIELD]) : undefined
        );
      })
    }

    return (
      <TransitionBar
        {...barProps}
        {...this.state}
        transitions={transitions.filter(Boolean)}
        statusNameExtractor={this.statusNameExtractor}
      />
    );
  }

  @autobind
  private statusNameExtractor(status: TStatus): string {
    return (status as IObjectWithIndex)[NAME_FIELD];
  }

}
