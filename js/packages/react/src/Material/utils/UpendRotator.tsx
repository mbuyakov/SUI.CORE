import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import React from "react";
import clsx from "clsx";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    upendRotator: {
      transition: theme.transitions.create("transform"),
    },
    upendRotatorFalse: {
      transform: "rotate(0deg)"
    },
    upendRotatorTrue: {
      transform: "rotate(180deg)"
    }
  }),
);

export const UpendRotator: React.FC<{
  children: JSX.Element,
  rotate: boolean
}> = ({
        children,
        rotate
      }) => {
  const classes = useStyles();

  return React.cloneElement(children, {
    className: clsx(children.props?.className, classes.upendRotator, {
      [classes.upendRotatorFalse]: !rotate,
      [classes.upendRotatorTrue]: rotate
    })
  });
}

