import { ThemesConfig } from '@sui/react';
export declare function defaultChainWebpack(config: any): void;
export interface UmiConfigParams {
    title: string;
    routes: any[];
    themes: ThemesConfig;
    define?: {
        [key: string]: string;
    };
    patchUmiConfig?: (config: any) => any;
}
export declare function generateUmiConfig(params: UmiConfigParams): any;
