import {Container} from "@sui/deps-ioc";
import {SuiModule} from "@sui/lib-module-manager";
import {ColorHeatMap, ColorHeatMapImpl, IColorHeatMapSettings} from "./ColorHeatMap";

export class LibColorModule extends SuiModule {
  constructor(settings: IColorHeatMapSettings) {
    super("LibColorModule", []);
    const colorHeatMap = new ColorHeatMapImpl(settings);
    Container.bind(ColorHeatMap).factory(() => colorHeatMap);
  }
}
