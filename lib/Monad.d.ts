export default class Monad<T> {
    private _value;
    constructor(value: T);
    bind<U>(transform: (value: T) => Monad<U>): Monad<U>;
    static of<T>(value: T): Monad<T>;
    unwrap(): T;
}
export declare class AsyncMonad<T> {
    private _value;
    constructor(value: T | Promise<T>);
    bind<U>(transform: (value: T) => AsyncMonad<U> | Promise<AsyncMonad<U>>): AsyncMonad<U>;
    static of<T>(value: T | Promise<T>): AsyncMonad<T>;
    unwrap(): Promise<T>;
}
