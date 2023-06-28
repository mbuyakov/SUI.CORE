// eslint-disable-next-line @typescript-eslint/ban-types
export type ISerializable<P extends {} = {}> = P & {
  __type?: string;
  id: string;
  version: number;
};

export interface ISerializableComponent<P extends ISerializable> {
  props: { plain?: P };

  getCurrentVersion(): number;

  toPlainObject(): P;
}
