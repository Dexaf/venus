type stateVarKey = string;
type StateVarObservers = Map<stateVarKey, ObserverCallbacks>;

type observerKey = string;
type ObserverCallbacks = Map<observerKey, ObserverCallback>;

type callbackKey = string;
type ObserverCallback = Map<callbackKey, Function>;
