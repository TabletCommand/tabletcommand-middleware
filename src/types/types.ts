
export type Nullable<T> = T | null | undefined;

export type SimpleCallback<T> = (err: Nullable<Error>, item?: Nullable<T>) => void;

// tslint:disable-next-line: no-any
export type AnyCallBack = (...a: any[]) => unknown;
