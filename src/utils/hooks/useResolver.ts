import { useRef } from "react";

export interface Deferred<T> {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason: unknown) => void;
  promise: Promise<T>;
}

export function withResolvers<T = void>(): Deferred<T> {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return { resolve, reject, promise };
}

export const useResolver = <T>() => {
  const resolverRef = useRef<(val: T) => void>();

  const start = () => {
    if (resolverRef.current) {
      throw new Error("last promise not resolved");
    }
    return new Promise<T>((res) => {
      resolverRef.current = res;
    });
  };

  const resolve = (val: T) => {
    if (!resolverRef.current) {
      throw new Error("resolve before start");
    }
    resolverRef.current(val);
    resolverRef.current = void 0;
  };

  return {
    start,
    resolve,
  };
};
