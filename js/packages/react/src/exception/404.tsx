import {Result} from "antd";
import React from 'react';
import {Button} from "@material-ui/core";
import {ArrowBackOutlined} from "@material-ui/icons";
import {useHistory} from "react-router-dom";

export const Exception404: React.FC = () => {
  const history = useHistory();

  return (
    <Result
      status="404"
      title="Страница не найдена"
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

export default Exception404;
