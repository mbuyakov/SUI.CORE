import {Result} from "antd";
import React from 'react';
import {Button} from "@mui/material";
import {ArrowBackOutlined} from "@mui/icons-material";
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
