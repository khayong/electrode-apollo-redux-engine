"use strict";

const combineReducerWithApollo = (reducer, client, key = "apollo") => {
  const apolloReducer = client.reducer();

  return function combination (state = {}, action) {
    // Remove appolo key to prevent unexpected key warning.
    const apolloState = state[key];
    delete state[key];

    const nextState = reducer(state, action);

    const previousStateForApollo = apolloState;
    const nextStateForApollo = apolloReducer(previousStateForApollo, action);

    if (previousStateForApollo !== nextStateForApollo) {
      return Object.assign({}, nextState, {[key]: nextStateForApollo});
    } else {
      nextState[key] = previousStateForApollo;
      return nextState;
    }
  };
};

module.exports = combineReducerWithApollo;
