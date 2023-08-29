import * as React from "react";

export abstract class SuiModule {
    public readonly name: string;
    public readonly deps: string[];

    protected abstract getName(): string;
    protected getDeps(): SuiModule[] {
        return [];
    };

    public constructor() {
        this.name = this.getName();
        this.deps = this.getDeps().map(it => it.getName());
    }

    public init(): Promise<void> {
        return Promise.resolve();
    }

    public modifyRoot(root: React.ReactNode): React.ReactNode {
        return root;
    }
}

