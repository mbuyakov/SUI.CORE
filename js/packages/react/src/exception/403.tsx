import {ArrowBackOutlined} from "@material-ui/icons";
import React from 'react';
import {Result} from "antd";
import {Button} from "@material-ui/core";
import {useHistory} from "react-router-dom";

export const Exception403: React.FC = () => {
  const history = useHistory();

  return (
    <Result
      status="403"
      title="Извините, у вас нет доступа к этой странице"
      extra={
        <Button
          size="large"
          startIcon={<ArrowBackOutlined/>}
          onClick={() => history.goBack()}
        >
          Вернуться назад
        </Button>
      }
    />
  );
}