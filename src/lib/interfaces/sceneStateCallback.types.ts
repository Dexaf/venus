type stateVarKey = string;
type StateVarObservers = Map<stateVarKey, ObserversCallbacks>;

type observerKey = string;
type ObserversCallbacks = Map<observerKey, ObserverCallback>;

type callbackKey = string;
type ObserverCallback = Map<callbackKey, Function>;
