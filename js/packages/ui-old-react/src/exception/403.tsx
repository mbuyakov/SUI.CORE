import {MuiIcons, Button, IconButton} from "@sui/deps-material";
import React from "react";
import {Result} from "@sui/deps-antd";
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
          startIcon={<MuiIcons.ArrowBackOutlined/>}
          onClick={() => history.goBack()}
        >
          Вернуться назад
        </Button>
      }
    />
  );
};
