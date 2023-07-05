import {MuiIcons, Button} from "@sui/deps-material";
import {Result} from "@sui/deps-antd";
import React from "react";
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
          startIcon={<MuiIcons.ArrowBackOutlined/>}
          onClick={() => history.goBack()}
        >
          Вернуться назад
        </Button>
      }
    />
  );
};

export default Exception404;
