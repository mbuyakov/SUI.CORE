import {Container} from "@sui/deps-ioc";
import {SuiModule} from "@sui/lib-module-manager";
import {ColorHeatMap, IColorHeatMapSettings} from "./ColorHeatMap";

export class LibColorModule extends SuiModule {
  constructor(settings: IColorHeatMapSettings) {
    super("LibColorModule", []);
    const colorHeatMap = new ColorHeatMap(settings);
    Container.bind(ColorHeatMap).factory(() => colorHeatMap);
  }
}
