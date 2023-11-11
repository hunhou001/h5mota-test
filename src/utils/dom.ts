import { withResolvers } from "./hooks/useResolver";

export const listenOnce = async <T extends keyof HTMLElementEventMap>(
  elm: HTMLElement,
  type: T,
  after: () => void
) => {
  const { promise, resolve } = withResolvers<HTMLElementEventMap[T]>();
  const listener = (e: HTMLElementEventMap[T]) => {
    resolve(e);
    elm.removeEventListener(type, listener);
  };
  elm.addEventListener(type, listener);
  after();
  return promise;
};
