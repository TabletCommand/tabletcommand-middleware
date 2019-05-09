export {};
declare module 'lodash' {
    interface LoDashStatic {
        isObject<T>(value?: T): value is Exclude<T, null>;
    }
}
