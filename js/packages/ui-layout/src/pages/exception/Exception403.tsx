import React from "react";
import {useHistory} from "@sui/deps-router";
import {Result} from "@sui/deps-antd";
import {Button, MuiIcons} from "@sui/deps-material";

export const Exception403: React.FC = () => {
  const history = useHistory();

  return (
    <Result
      status="403"
      title="Извините, у вас нет доступа к этой странице"
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
