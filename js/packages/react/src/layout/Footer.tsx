import React from 'react';
import {makeStyles, Theme} from "@material-ui/core/styles";
import {Typography} from "@material-ui/core";
import classNames from "classnames";
import {getSUISettings} from "@sui/core";
import {FooterAdditionalActions} from "@/layout/FooterAdditionalActions";

const useStyles = makeStyles((theme: Theme) => ({
  footer: {
    maxWidth: document.documentElement.style.width != '' ? document.documentElement.style.width : undefined,
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6),
    color: theme.palette.text.disabled,
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center"
  }
}));

export const Footer: React.FC<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  showAdditionalButtons: boolean
}> = ({
        showAdditionalButtons,
        children,
        ...rest
      }) => {
  const styles = useStyles();

  return (
    <div
      {...rest}
      className={classNames(styles.footer, rest.className)}
    >
      <Typography>
        Время сборки:&nbsp;{getSUISettings().buildTime}
        {children}
      </Typography>
      {showAdditionalButtons && <FooterAdditionalActions/>}
    </div>
  );
}


