import React, {
  ComponentType,
  FC,
  ReactNode,
  createContext,
  useContext,
} from "react";
import { EMPTY } from "@/utils/empty";

export interface ModelProviderProps {
  children: ReactNode;
}

export interface Model<Value> {
  (): Value;
  Provider: ComponentType<ModelProviderProps>;
}

export function createModel<Value>(useHook: () => Value): Model<Value> {
  const Context = createContext<Value | typeof EMPTY>(EMPTY);

  const Provider: FC<ModelProviderProps> = (props) => {
    const value = useHook();
    return <Context.Provider value={value}>{props.children}</Context.Provider>;
  };

  const useModel = (): Value => {
    const value = useContext(Context);
    if (value === EMPTY) {
      throw new Error("Component must be wrapped with <Container.Provider>");
    }
    return value;
  };

  useModel.Provider = Provider;

  return useModel;
}

export interface InitializedModelProviderProps<State = void> {
  initialState: State;
  children: React.ReactNode;
}

export interface InitializedModel<Value, State = void> {
  (): Value;
  Provider: React.ComponentType<InitializedModelProviderProps<State>>;
}

export function createInitializedModel<Value, State = void>(
  useHook: (initialState: State) => Value
): InitializedModel<Value, State> {
  const Context = React.createContext<Value | typeof EMPTY>(EMPTY);

  const Provider = (props: InitializedModelProviderProps<State>) => {
    const value = useHook(props.initialState);
    return <Context.Provider value={value}>{props.children}</Context.Provider>;
  };

  const useModel = (): Value => {
    const value = React.useContext(Context);
    if (value === EMPTY) {
      throw new Error("Component must be wrapped with <Container.Provider>");
    }
    return value;
  };

  useModel.Provider = Provider;

  return useModel;
}

export const mergeProviders = (
  models: Model<any>[]
): FC<{ children: ReactNode }> => {
  const EmptyProvider: FC<{ children: ReactNode }> = ({ children }) => (
    <>{children}</>
  );

  const Provider = models
    .map((model) => model.Provider)
    .reduce(
      (PrevProvider, CurrentProvider) =>
        ({ children }) =>
          (
            <PrevProvider>
              <CurrentProvider>{children}</CurrentProvider>
            </PrevProvider>
          ),
      EmptyProvider
    );

  return ({ children }) => <Provider>{children}</Provider>;
};
