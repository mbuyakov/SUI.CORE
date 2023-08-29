import {Container} from "@sui/deps-ioc";
import {SuiModuleWithSettings} from "@sui/lib-module-manager";
import {ColorHeatMap, ColorHeatMapImpl, IColorHeatMapSettings} from "./ColorHeatMap";

export class LibColorModule extends SuiModuleWithSettings<IColorHeatMapSettings> {
    protected getName(): string {
        return "LibColorModule";
    }

    override async init(): Promise<void> {
        const colorHeatMap = new ColorHeatMapImpl(this.settings);
        Container.bind(ColorHeatMap).factory(() => colorHeatMap);
    }
}
