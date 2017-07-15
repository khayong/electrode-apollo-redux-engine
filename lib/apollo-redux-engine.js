"use strict";

const assert = require("assert");
const optionalRequire = require("optional-require")(require);
const React = optionalRequire("react");
const ReactDomServer = optionalRequire("react-dom/server");
const ReactRouter = require("react-router");
const Provider = require("react-redux").Provider;
const ApolloProvider = require("react-apollo").ApolloProvider;

const combineReducerWithApollo = (reducer, client, key = "apollo") => {
  const apolloReducer = client.reducer();

  return function combination(state = {}, action) {
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

const renderToString = (req, store, match, withIds) => { // eslint-disable-line
  if (req.app && req.app.disableSSR) {
    return "";
  } else {
    assert(React, "Can't do SSR because React module is not available");
    assert(ReactDomServer, "Can't do SSR because ReactDomServer module is not available");

    const app = req.server && req.server.app || req.app;
    if (app.apollo) {
      return (withIds ? ReactDomServer.renderToString : ReactDomServer.renderToStaticMarkup)(
        React.createElement(
          ApolloProvider, { store, client: app.apollo },
          React.createElement(ReactRouter.RouterContext, match.renderProps)
        )
      );
    } else {
      return (withIds ? ReactDomServer.renderToString : ReactDomServer.renderToStaticMarkup)(
        React.createElement(
          Provider, { store },
          React.createElement(ReactRouter.RouterContext, match.renderProps)
        )
      );
    }
  }
};

module.exports = {
  combineReducerWithApollo,
  renderToString
};
