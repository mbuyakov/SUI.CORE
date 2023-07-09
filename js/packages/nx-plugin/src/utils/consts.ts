export const mapModules = {
  "@material-ui/icons": "@mui/icons-material",
  "@material-ui/core": "@sui/deps-material",
  "@mui/material": "@sui/deps-material",
  "antd": "@sui/deps-antd",
  "typescript-ioc": "@sui/deps-ioc",
  "@sui/amcharts": "@sui/deps-amcharts",
  "react-router": "@sui/deps-router",
  "react-router-dom": "@sui/deps-router",
};

export const newImports = {
  "@sui/ui-observable": [
    "Observable",
    "IObservableBinderProps",
    "ObservableBinder",
    "ObservableLocalStorageValue",
    "ObservableHandler",
    "ObservableHandlerStub",
    "joinObservables2",
    "joinObservables3",
    "joinObservables4",
    "joinObservables5",
    "joinObservables6"
  ],
  "@sui/util-chore": [
    "DataKey",
    "normalizeDataKey",
    "concatDataKey",
    "getDataByKey",
    "DataKeyNode",
    "dataKeysToDataTree",
    "TOrCallback",
    "getTOrCall"
  ],
  "@sui/util-types": [
    "Class",
    "Nullable",
    "NotFunction",
    "IObjectWithIndex"
  ]
};
