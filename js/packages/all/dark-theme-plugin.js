import {join} from 'path';
import {existsSync, mkdirSync} from 'fs';
import serveStatic from 'serve-static';
import rimraf from 'rimraf';
import buildCss from 'antd-pro-merge-less';

export default function (
  api,
  options
) {
  const {cwd, outputPath, absNodeModulesPath} = api.paths;
  const tempMergeLessFolder = api.winPath(join(absNodeModulesPath, 'antd-pro-merge-less', '.temp'));
  const tempThemeFolder = api.winPath(join(absNodeModulesPath, '.dark-theme-plugin'));

  if (existsSync(api.winPath(tempMergeLessFolder))) {
    rimraf.sync(api.winPath(tempMergeLessFolder));
  }

  if (!existsSync(api.winPath(tempThemeFolder))) {
    mkdirSync(api.winPath(tempThemeFolder));
  }

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
        console.log(error);
      }
      firstBuild = false;
    }

    buildCss(
      cwd,
      [
        {
          // theme: 'dark',
          fileName: api.winPath(join(targetFolder, 'theme', 'dark.css')),
          modifyVars: options,
        }
      ],
      {
        ignoreAntd: false,
        // isModule: false,
        cache: true,
        extraLibraries: ['@sui/react']
      }
    )
      .catch(e => {
        console.log(e);
      });
  }

  api.onBuildSuccess(onBuild(false));
  api.onDevCompileDone(onBuild(true));
}
