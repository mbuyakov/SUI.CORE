import { TableRenderParamsPlugin } from './TableRenderParamsPlugin';

export class RawPlugin extends TableRenderParamsPlugin<{}> {
  public constructor() {
    super('raw', 'По умолчанию', false);
  }

  // tslint:disable-next-line:prefer-function-over-method
  public async baseTableColGenerator(): Promise<void> {
    return;
  }
}
