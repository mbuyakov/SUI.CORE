export type Allowed<T extends {}> = ({ allowed: true; } & T) | { allowed: false }
