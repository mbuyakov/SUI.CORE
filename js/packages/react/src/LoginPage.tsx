import React, {HTMLAttributes, KeyboardEvent, useContext} from "react";
import {Backdrop, Card, CardContent, CircularProgress, Divider, InputAdornment, TextField} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import PersonOutlinedIcon from "@material-ui/icons/PersonOutlined";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import {SuiThemeContext, ThemeSwitchButton} from "@/themes";
import {BlockUIConditionally} from "@/other";
import {SUI_ROW_CONTAINER} from "@/styles";
import {MaterialButton} from "@/Material";
import {Footer} from "@/layout";

export const LoginPage: React.FC<{
  title: string;
  loading: boolean;
  disabled?: boolean;
  inputMode?: HTMLAttributes<any>["inputMode"];
  warnText?: string;
  errorText?: string;
  usernameRef: React.RefObject<HTMLInputElement>;
  passwordRef: React.RefObject<HTMLInputElement>;
  additionalButtons?: React.ReactNode;
  footerExtra?: React.ReactNode;
  onKeyDown(event: KeyboardEvent): void;
  onLogin(): void;
  blockUiFunction(): Promise<React.ReactNode>;
}> = (props) => {
  const {
    title,
    loading,
    disabled,
    inputMode,
    warnText,
    errorText,
    usernameRef,
    passwordRef,
    additionalButtons,
    footerExtra,
    onKeyDown,
    onLogin,
    blockUiFunction
  } = props;

  const theme = useContext(SuiThemeContext);

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          backgroundColor: theme.name === "dark" ? "#000" : theme.lessVars['layout-body-background']
        }}
      >
        <BlockUIConditionally functionToCheck={blockUiFunction}>
          <Card
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 400,
              margin: 30,
              zIndex: 2
            }}
            elevation={6}
          >
            <Backdrop
              style={{
                position: "absolute",
                zIndex: 2,
                opacity: 0.7
              }}
              open={loading}
            >
              <CircularProgress color="primary"/>
            </Backdrop>
            <CardContent
              style={{
                paddingTop: 8,
                paddingBottom: 8,
                height: 64,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span style={{fontSize: 16}}>{title}</span>
              {!process.env.NO_DARK && <ThemeSwitchButton/>}
            </CardContent>
            <Divider/>
            <CardContent
              style={{
                paddingBottom: 16
              }}
            >
              <div className={SUI_ROW_CONTAINER}>
                {warnText && <Alert children={warnText} severity="warning" icon={false}/>}
                {errorText && <Alert children={errorText} severity="error" icon={false}/>}
                <TextField
                  inputRef={usernameRef}
                  disabled={loading || disabled}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlinedIcon/>
                      </InputAdornment>
                    )
                  }}
                  label="Пользователь"
                  onKeyDown={onKeyDown}
                />
                <TextField
                  inputRef={passwordRef}
                  disabled={loading || disabled}
                  inputProps={{
                    inputMode
                  }}
                  // inputProps and InputProps is NOT same props
                  // eslint-disable-next-line react/jsx-no-duplicate-props
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon/>
                      </InputAdornment>
                    )
                  }}
                  type="password"
                  label={inputMode == "numeric" ? "ПИН-код" : "Пароль"}
                  onKeyDown={onKeyDown}
                />
                <MaterialButton
                  variant="contained"
                  color="primary"
                  style={{width: "100%"}}
                  disabled={loading || disabled}
                  onClick={onLogin}
                >
                  Войти
                </MaterialButton>
                {additionalButtons}
              </div>
            </CardContent>
          </Card>
        </BlockUIConditionally>
      </div>
      <Footer
        showAdditionalButtons={false}
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%"
        }}
      >
        {footerExtra}
      </Footer>
    </>
  )
}
