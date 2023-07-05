import React, {useContext} from "react";
import {CssBaseline} from "@sui/deps-material";
import {IRawRoute} from "@sui/ui-old-core";
import pathToRegexp from "path-to-regexp";
import {Location} from "history";
import {Footer} from "@/layout/Footer";
import {useMediaQuery} from "@/hooks";
import {BasicLayoutContext} from "@/layout/BasicLayoutContext";
import {Header} from "@/layout/Header";
import {Drawer} from "@/layout/Drawer";
import {Authorized} from "@/layout/Authorized";
import {Exception404} from "@/exception";
import {isAdmin} from "@sui/lib-auth";
import {SuiThemeContext, SuiThemeProvider} from "@sui/ui-themes";


//TODO restore style

// const useStyles = makeStyles<Theme, {
//   drawerWidth: number;
//   isMobile: boolean;
// }>((theme: Theme) =>
//   createStyles({
//     root: {
//       display: 'flex',
//     },
//     toolbar: {
//       // Necessary for content to be below app bar
//       ...theme.mixins.toolbar,
//     },
//     main: ({drawerWidth, isMobile}) => ({
//       minHeight: '100vh',
//       maxWidth: `calc(100% - ${isMobile ? 0 : drawerWidth}px)`,
//       flexGrow: 1,
//       display: 'flex',
//       flexDirection: 'column',
//       backgroundColor: theme.palette.background.default,
//       transition: theme.transitions.create('max-width')
//     }),
//     content: {
//       paddingTop: theme.spacing(3),
//       flexGrow: 1,
//       maxWidth: '100%',
//       paddingLeft: theme.spacing(3),
//       paddingRight: theme.spacing(3),
//     }
//   }),
// );

const NARROW_MEDIA_QUERY = "(max-width: 999px)";

function hasValidChildRoute(key: any, routes: any): boolean {
  return routes && routes.some(route => {
    if (route.path && pathToRegexp(route.path).test(key)) {
      return true;
    }
    if (route.routes) {
      return hasValidChildRoute(key, route.routes);
    }
    return false;
  });
}


export const BasicLayout: React.FC<{
  children: React.ReactElement<{ route: IRawRoute }>;
  title(drawerOpen: boolean): React.ReactNode;
  routes: IRawRoute[];
  header: React.ReactNode;
  footerExtra?: React.ReactNode;
  openDrawerWidth?: number;
  showAdditionalFooterButtons?: boolean;
  location: Location;
  isMobile?: boolean;
}> = ({
        children,
        title,
        routes,
        header,
        footerExtra,
        openDrawerWidth = 256,
        showAdditionalFooterButtons,
        location,
        isMobile: isMobileProps,
      }) => {

  // max-device-width for Chrome emulator, max-width for usual page
  const isMobileQuery = useMediaQuery("(max-device-width: 599px), (max-width: 599px)");
  const isNarrow = window.matchMedia(NARROW_MEDIA_QUERY).matches;
  const isMobile = isMobileProps || isMobileQuery;

  const theme = useContext(SuiThemeContext);
  const closeDrawerWidth = Number(theme.mui.spacing(7)) + 1;
  const [drawerState, setDrawerState] = React.useState<boolean>(!isMobile && !isNarrow);

  useMediaQuery(NARROW_MEDIA_QUERY, isNowNarrow => {
    if (!isMobileProps) {
      setDrawerState(!isNowNarrow);
    }
  });

  let drawerWidth = drawerState ? openDrawerWidth : closeDrawerWidth;

  // const classes = useStyles({drawerWidth, isMobile});

  return (
    <div /*className={classes.root}*/>
      <CssBaseline/>
      {/* eslint-disable-next-line react/jsx-no-constructed-context-values */}
      <BasicLayoutContext.Provider value={{drawerOpen: drawerState, setDrawerState, openDrawerWidth, drawerWidth, routes}}>
        <Header isMobile={isMobile}>
          {header}
        </Header>
        <SuiThemeProvider component="drawer">
          <Drawer
            title={title}
            isMobile={isMobile}
          />
        </SuiThemeProvider>
      </BasicLayoutContext.Provider>
      <main /*className={classes.main}*/>
        <div /*className={classes.toolbar}*//>
        <div /*className={classes.content}*/>
          {hasValidChildRoute(location.pathname, routes)
            ? <Authorized>
              {children}
            </Authorized>
            : <Exception404/>
          }
        </div>
        <Footer showAdditionalButtons={showAdditionalFooterButtons ?? isAdmin()}>
          {footerExtra}
        </Footer>
      </main>
    </div>
  )
    ;
};
