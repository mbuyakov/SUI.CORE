import React, {useContext, useMemo, useState} from "react";
import {useAsyncEffect} from "@sui/lib-hooks";
import {ModuleManager} from "@sui/lib-module-manager";
import {
    Card,
    CardContent,
    CircularProgress,
    createTheme,
    MuiIcons,
    ThemeProvider,
    Typography
} from "@sui/deps-material";
import {KludgeForStorybook, SuiThemeConfig, SuiThemeVariants, UiThemesModule} from "@sui/ui-themes";
import {Container} from "@sui/deps-ioc";
import {LibNotificationDispatcherModule} from "@sui/lib-notification-dispatcher";
import {UiNotificationHandlerModule} from "@sui/ui-notification-handler";
import {LibStorageModule} from "@sui/lib-storage";
import {IColorHeatMapSettings, LibColorModule} from "@sui/lib-color";
import {AccessRights, LibAuthModule} from "@sui/lib-auth";

export type DisablableModuleSettings<T> = T & {
    disabled?: boolean
};

export type ModulesSettings = {
    // eslint-disable-next-line @typescript-eslint/ban-types
    LibNotificationDispatcherModule?: DisablableModuleSettings<{}>
    // eslint-disable-next-line @typescript-eslint/ban-types
    UiNotificationHandlerModule?: DisablableModuleSettings<{}>
    // eslint-disable-next-line @typescript-eslint/ban-types
    LibStorageModule?: DisablableModuleSettings<{}>
    LibColorModule: DisablableModuleSettings<IColorHeatMapSettings>
    UiThemesModule: DisablableModuleSettings<SuiThemeConfig>,
    LibAuthModule: DisablableModuleSettings<AccessRights>
};

const isDisabledModule = (it: DisablableModuleSettings<any>): boolean => {
    return it?.disabled === true;
};

export const ModuleManagerRoot: React.FC<{
    children: React.ReactNode,
    projectKey: string,
    restUrl: string,
    settings: ModulesSettings,
    additionalSettings?: (mm: ModuleManager) => Promise<void>
}> = ({
          children,
          projectKey,
          restUrl,
          settings,
          additionalSettings
      }) => {
    const moduleManager = useMemo(() => new ModuleManager(projectKey, restUrl), [projectKey, restUrl]);
    const [settingsApplied, setSettingsApplied] = useState(false);
    const [modulesInitialized, setModulesInitialized] = useState(false);
    const [error, setError] = useState<Error>();
    const kludgeForStorybook: SuiThemeVariants | undefined = useContext(KludgeForStorybook);

    useAsyncEffect(async () => {
        try {
            !isDisabledModule(settings.LibNotificationDispatcherModule) && moduleManager.addModule(new LibNotificationDispatcherModule());
            !isDisabledModule(settings.UiNotificationHandlerModule) && moduleManager.addModule(new UiNotificationHandlerModule());
            !isDisabledModule(settings.LibStorageModule) && moduleManager.addModule(new LibStorageModule());
            !isDisabledModule(settings.LibColorModule) && moduleManager.addModule(new LibColorModule(settings.LibColorModule));
            !isDisabledModule(settings.UiThemesModule) && moduleManager.addModule(new UiThemesModule(settings.UiThemesModule));
            !isDisabledModule(settings.LibAuthModule) && moduleManager.addModule(new LibAuthModule(settings.LibAuthModule));

            if (additionalSettings) {
                await additionalSettings(moduleManager);
            }
            setSettingsApplied(true);

            await moduleManager.init();
            setModulesInitialized(true);
        } catch (e) {
            console.error(e);
            setError(e as Error);
        }
    }, []);

    if (modulesInitialized) {
        return (
            <>
                {moduleManager.modifyRoot(children)}
            </>
        );
    }

    return (
        <ThemeProvider
            theme={createTheme({
                palette: {
                    mode: kludgeForStorybook
                        || localStorage.getItem(Container.getValue("sui.projectKey") + "_theme") as SuiThemeVariants
                        || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
                            ? "dark"
                            : "light")
                }
            })}
        >
            <Card
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "100vw",
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >
                <Card
                    elevation={12}
                    sx={{margin: 4}}
                >
                    <CardContent
                        style={{
                            display: "flex",
                            alignItems: "center",
                            flexDirection: "column"
                        }}
                    >
                        {error
                            ? (
                                <MuiIcons.Error fontSize="large" color="error"/>
                            )
                            : (
                                <CircularProgress size={35}/>
                            )}
                        <Typography
                            variant="h5">{error ? "Ошибка при инициализации" : !settingsApplied ? "Применение настроек" : "Инициализация модулей"}</Typography>
                        {error && (<>
                            <Typography variant="subtitle1">
                                {error.toString()}
                            </Typography>
                            <Typography variant="body2" sx={{whiteSpace: "pre-wrap"}}>
                                {error.stack}
                            </Typography>
                        </>)}
                    </CardContent>
                </Card>
            </Card>
        </ThemeProvider>
    );
};
