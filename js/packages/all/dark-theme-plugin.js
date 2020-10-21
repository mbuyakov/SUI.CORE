import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import serveStatic from 'serve-static';
import rimraf from 'rimraf';
import { getThemeVariables } from 'antd/dist/theme';
import buildCss from 'antd-pro-merge-less';

const darkTheme = getThemeVariables({dark: true});

export default function(
  api,
  options
) {
  const { cwd, outputPath, absNodeModulesPath } = api.paths;
  const tempThemeFolder = api.winPath(join(absNodeModulesPath, '.plugin-theme'));

  api.addMiddlewareAhead(() => {
    return serveStatic(tempThemeFolder);
  });

  let firstBuild = true;

  const onBuild = (isDev) => () => {
    const targetFolder = isDev ? tempThemeFolder : outputPath;
    if (firstBuild) {
      try {
        if (existsSync(api.winPath(join(targetFolder, 'theme')))) {
          rimraf.sync(api.winPath(join(targetFolder, 'theme')));
        }
        mkdirSync(api.winPath(join(targetFolder, 'theme')));
      } catch (error) {
        // console.log(error);
      }
      firstBuild = false;
    }

    buildCss(
      cwd,
      [
        {
          theme: 'dark',
          fileName: api.winPath(join(targetFolder, 'theme', 'dark.css')),
          modifyVars: {
            ...darkTheme,
            ...options
          },
        }
      ],
      {
        ignoreAntd: false,
        // isModule: false,
        cache: true
      }
    )
      .catch(e => {
        console.log(e);
      });
  }

  api.onBuildSuccess(onBuild(false));
  api.onDevCompileDone(onBuild(true));
}
