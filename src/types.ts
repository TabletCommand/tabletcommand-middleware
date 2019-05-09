
export type Nullable<T> = T | null | undefined;

export type SimpleCallback<T> = (err: Nullable<Error>, item?: Nullable<T>) => void;