set -e
VERSION="7.0.$(date +"%Y%m%d%I%M%S")-CANARY"
yarn ci
cp package.json package.json.bkp
yarn publish --registry http://verdaccio.smp.cloudcom.ru/ --non-interactive --no-git-tag-version --new-version $VERSION
rm package.json
mv package.json.bkp package.json
printf "yarn add @sui/sui-all@$VERSION" | pbcopy
echo "New version: $VERSION (command to add dep copied to clipboard)"
