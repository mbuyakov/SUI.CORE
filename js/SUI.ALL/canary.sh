cp package.json package.json.bkp
yarn publish --registry http://verdaccio.smp.sm-soft.ru/ --non-interactive --no-git-tag-version --new-version 6.0.$(date +"%Y%m%d%I%M%S")-CANARY
rm package.json
mv package.json.bkp package.json
