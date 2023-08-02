import {Theme} from "@sui/deps-material";
// import createStyles from '@mui/styles/createStyles';
// import makeStyles from '@mui/styles/makeStyles';
import React from "react";
import clsx from "clsx";

//TODO restore style

// const useStyles = makeStyles((theme: Theme) =>
//   createStyles({
//     upendRotator: {
//       transition: theme.transitions.create("transform"),
//     },
//     upendRotatorFalse: {
//       transform: "rotate(0deg)"
//     },
//     upendRotatorTrue: {
//       transform: "rotate(180deg)"
//     }
//   }),
// );

export const UpendRotator: React.FC<{
  children: React.JSX.Element,
  rotate: boolean
}> = ({
        children,
        rotate
      }) => {
  // const classes = useStyles();

  return React.cloneElement(children, {
    // className: clsx(children.props?.className, classes.upendRotator, {
    //   [classes.upendRotatorFalse]: !rotate,
    //   [classes.upendRotatorTrue]: rotate
    // })
  });
};

