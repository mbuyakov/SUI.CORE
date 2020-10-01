
export interface AMCHARTS {
  am4core: typeof import('@amcharts/amcharts4/core'),
  am4charts: typeof import('@amcharts/amcharts4/charts'),
  am4lang_ru_RU: typeof import('@amcharts/amcharts4/lang/ru_RU').default,
  am4themes_animated: typeof import('@amcharts/amcharts4/themes/animated').default,
  am4maps: typeof import('@amcharts/amcharts4/maps'),
  am4forceDirected: typeof import('@amcharts/amcharts4/plugins/forceDirected'),
  am4wordCloud: typeof import('@amcharts/amcharts4/plugins/wordCloud')
}

// Strange bug. Can't import Irange from am4core
type Optional<A> = A | undefined;
export interface IRange {
  start: Optional<number>;
  end: Optional<number>;
  priority?: "start" | "end";
}

let amcharts_loaded: AMCHARTS = null;

export async function getAmcharts(): Promise<AMCHARTS> {
  if (!amcharts_loaded) {
    const [
      am4core,
      am4charts,
      am4lang_ru_RU,
      am4themes_animated,
      am4maps,
      am4forceDirected,
      am4wordCloud
    ] = await Promise.all([
      import('@amcharts/amcharts4/core'),
      import('@amcharts/amcharts4/charts'),
      import('@amcharts/amcharts4/lang/ru_RU'),
      import('@amcharts/amcharts4/themes/animated'),
      import('@amcharts/amcharts4/maps'),
      import('@amcharts/amcharts4/plugins/forceDirected'),
      import('@amcharts/amcharts4/plugins/wordCloud')
    ]);

    am4core.useTheme(am4themes_animated.default);
    am4core.options.minPolylineStep = 5;

    amcharts_loaded = {
      am4core,
      am4charts,
      am4lang_ru_RU: am4lang_ru_RU.default,
      am4themes_animated: am4themes_animated.default,
      am4maps,
      am4forceDirected,
      am4wordCloud
    };
  }
  (new amcharts_loaded.am4forceDirected.ForceDirectedTree()).data = [];
  return amcharts_loaded;
}
