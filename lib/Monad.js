"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncMonad = void 0;
class Monad {
    constructor(value) {
        this._value = value;
    }
    bind(transform) {
        return transform(this._value);
    }
    static of(value) {
        return new Monad(value);
    }
    unwrap() {
        return JSON.parse(JSON.stringify(this._value));
    }
}
exports.default = Monad;
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
class AsyncMonad {
    constructor(value) {
        this._value = Promise.resolve(value);
    }
    bind(transform) {
        const promiseValue = this._value.then(value => transform(value));
        const nestedPromiseMonad = Promise.resolve(promiseValue).then((promiseMonad) => __awaiter(this, void 0, void 0, function* () { return promiseMonad.unwrap(); }));
        return new AsyncMonad(nestedPromiseMonad);
    }
    static of(value) {
        return new AsyncMonad(value);
    }
    unwrap() {
        return __awaiter(this, void 0, void 0, function* () {
            // return JSON.parse(JSON.stringify(await this._value)) as T;
            return yield this._value;
        });
    }
}
exports.AsyncMonad = AsyncMonad;
