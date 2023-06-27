import {addCss, lazyInit} from "@sui/util-chore";

export interface AMCHARTS {
  am4core: typeof import('@amcharts/amcharts4/core'),
  am4charts: typeof import('@amcharts/amcharts4/charts'),
  am4lang_ru_RU: typeof import('@amcharts/amcharts4/lang/ru_RU').default,
  am4themes_animated: typeof import('@amcharts/amcharts4/themes/animated').default,
  am4themes_dark: typeof import('@amcharts/amcharts4/themes/dark').default,
  am4maps: typeof import('@amcharts/amcharts4/maps'),
  am4forceDirected: typeof import('@amcharts/amcharts4/plugins/forceDirected'),
  am4wordCloud: typeof import('@amcharts/amcharts4/plugins/wordCloud')
}

// eslint-disable-next-line no-restricted-imports
export type {AMEvent} from "@amcharts/amcharts4/core";
// eslint-disable-next-line no-restricted-imports
export type {ListTemplate} from "@amcharts/amcharts4/core";

// Strange bug. Can't import IRange from am4core
type Optional<A> = A | undefined;

export interface IRange {
  start: Optional<number>;
  end: Optional<number>;
  priority?: "start" | "end";
}

export const getAmcharts = lazyInit<Promise<AMCHARTS>>(() => Promise.all([
  import('@amcharts/amcharts4/core'),
  import('@amcharts/amcharts4/charts'),
  import('@amcharts/amcharts4/lang/ru_RU'),
  import('@amcharts/amcharts4/themes/animated'),
  import('@amcharts/amcharts4/themes/dark'),
  import('@amcharts/amcharts4/maps'),
  import('@amcharts/amcharts4/plugins/forceDirected'),
  import('@amcharts/amcharts4/plugins/wordCloud')
])
  .then(data => {
    const [
      am4core,
      am4charts,
      am4lang_ru_RU,
      am4themes_animated,
      am4themes_dark,
      am4maps,
      am4forceDirected,
      am4wordCloud
    ] = data;

    am4core.useTheme(am4themes_animated.default);
    am4core.options.minPolylineStep = 5;

    addCss('amcharts', `
      g[opacity="0.4"], g[opacity="0.3"] {
        display: none !important;
      }

      .amcharts-amexport-item a {
        color: black;
      }

      body[data-theme='dark'] .amcharts-amexport-item a {
        color: white !important;
      }
    `);

    return {
      am4core,
      am4charts,
      am4lang_ru_RU: am4lang_ru_RU.default,
      am4themes_animated: am4themes_animated.default,
      am4themes_dark: am4themes_dark.default,
      am4maps,
      am4forceDirected,
      am4wordCloud
    };
  }));
