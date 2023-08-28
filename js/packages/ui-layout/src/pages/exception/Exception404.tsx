import React from "react";
import {useHistory} from "@sui/deps-router";
import {Result} from "@sui/deps-antd";
import {Button, MuiIcons} from "@sui/deps-material";

export const Exception404: React.FC = () => {
  const history = useHistory();

  return (
    <Result
      status="404"
      title="Страница не найдена"
      extra={
        <Button
          size="large"
          startIcon={<MuiIcons.ArrowBackOutlined/>}
          onClick={() => history.goBack()}
        >
          Вернуться назад
        </Button>
      }
    />
  );
};
