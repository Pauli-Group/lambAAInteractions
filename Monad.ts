export default class Monad<T> {
    private _value: T;

    constructor(value: T) {
        this._value = value;
    }

    bind<U>(transform: (value: T) => Monad<U>): Monad<U> {
        return transform(this._value);
    }

    static of<T>(value: T): Monad<T> {
        return new Monad(value);
    }

    unwrap(): T {
        return JSON.parse(JSON.stringify(this._value)) as T;
    }

}

// export class AsyncMonad<T> {
//     private _value: Promise<T>;

//     constructor(value: T | Promise<T>) {
//         this._value = Promise.resolve(value);
//     }

//     async bind<U>(transform: (value: T) => AsyncMonad<U> | Promise<AsyncMonad<U>>): Promise<AsyncMonad<U>> {
//         return transform(await this._value);
//     }

//     static of<T>(value: T | Promise<T>): AsyncMonad<T> {
//         return new AsyncMonad(value);
//     }

//     async unwrap(): Promise<T> {
//         return JSON.parse(JSON.stringify(await this._value)) as T;
//     }
// }

export class AsyncMonad<T> {
    private _value: Promise<T>;

    constructor(value: T | Promise<T>) {
        this._value = Promise.resolve(value);
    }

    bind<U>(transform: (value: T) => AsyncMonad<U> | Promise<AsyncMonad<U>>): AsyncMonad<U> {
        const promiseValue = this._value.then(value => transform(value));
        const nestedPromiseMonad = Promise.resolve(promiseValue).then(async promiseMonad => promiseMonad.unwrap());
        return new AsyncMonad<U>(nestedPromiseMonad);
    }

    static of<T>(value: T | Promise<T>): AsyncMonad<T> {
        return new AsyncMonad(value);
    }

    async unwrap(): Promise<T> {
        // return JSON.parse(JSON.stringify(await this._value)) as T;
        return await this._value;
    }
}
