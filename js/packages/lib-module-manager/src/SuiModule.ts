import * as React from "react";

export abstract class SuiModule {
  public readonly name: string;
  public readonly deps: string[];

  protected constructor(name: string, deps: string[] = []) {
    this.name = name;
    this.deps = deps;
  }

  public init(): Promise<void> {
    return Promise.resolve();
  }

  public modifyRoot(root: React.ReactNode): React.ReactNode {
    return root;
  }
}
