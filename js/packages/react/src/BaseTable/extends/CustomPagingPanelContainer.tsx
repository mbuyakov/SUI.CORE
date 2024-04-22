import {PagingPanel} from '@devexpress/dx-react-grid-material-ui';
import * as React from "react";
import {ReactElement} from "react";
import Select from '@material-ui/core/Select';
import {PagingPanel as PagingPanelBase} from "@devexpress/dx-react-grid";
import {Input} from "@material-ui/core";
import debounce from "lodash/debounce";

const DEBOUNCE_ON_CHANGE_MS = 1000;
const MAX_NUMBER_TO_SELECT_IN_MENU = 20;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ICustomPagingContainer = PagingPanel.ContainerProps & { className?: string; style?: React.CSSProperties; [x: string]: any };

export function CustomPagingPanelContainer(props: ICustomPagingContainer): ReactElement<PagingPanelBase.ContainerProps> {
  const debouncedOnChange = props.onCurrentPageChange && debounce(props.onCurrentPageChange, DEBOUNCE_ON_CHANGE_MS);
  const input = props.totalPages <= MAX_NUMBER_TO_SELECT_IN_MENU
    ? (
      <Select
        key={`select-${props.currentPage}`}
        native
        defaultValue={props.currentPage}
        disableUnderline={true}
        onChange={(event): void => props.onCurrentPageChange && props.onCurrentPageChange(event.target.value as number || 0)}
      >
        {Array.from({length: props.totalPages}, (_, key) => (
          <option key={key} value={key}>{key + 1}</option>
        ))}
      </Select>
    )
    : (
      <Input
        key={`input-${props.currentPage}`}
        defaultValue={props.currentPage + 1}
        disableUnderline
        inputProps={{
          min: 1,
          max: props.totalPages,
          type: "number",
        }}
        onChange={(event): void => {
          if (!!debouncedOnChange) {
            const page = event.target.value && parseInt(event.target.value, 10);
            debouncedOnChange((!page || isNaN(page)) ? 0 : page - 1);
          }
        }}
        style={{
          border: "none",
          fontSize: "14px",
          fontFamily: "Roboto, Helvetica, Arial, sans-serif",
          fontWeight: 400,
          lineHeight: "1.1876em",
          letterSpacing: "0.00938em",
        }}
        type="number"
      />
    );

  return (
    <div style={{display: "flex", justifyContent: "flex-end"}}>
      <PagingPanel.Container
        {...props}
      />
      <div style={{flex: "none", display: "flex", padding: "12px", overflow: "hidden", alignItems: "center", justifyContent: "flex-end"}}>
        <span style={{
          fontSize: "0.75rem",
          fontFamily: "Roboto, Helvetica, Arial, sans-serif",
          fontWeight: 400,
          lineHeight: 1.66,
          letterSpacing: "0.03333em",
          paddingRight: "24px",
        }}
        >
          Страница
        </span>
        {input}
      </div>
    </div>
  );
}
