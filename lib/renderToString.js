"use strict";

require("isomorphic-fetch");
const assert = require("assert");
const optionalRequire = require("optional-require")(require);
const React = optionalRequire("react");
const ReactDomServer = optionalRequire("react-dom/server");
const ReactApollo = optionalRequire("react-apollo");
const ReactRouter = require("react-router");
const Provider = require("react-redux").Provider;

const renderToString = (req, store, match, withIds) => { // eslint-disable-line
  if (req.app && req.app.disableSSR) {
    return "";
  } else {
    assert(React, "Can\'t do SSR because React module is not available");
    assert(ReactDomServer,
      "Can\'t do SSR because ReactDomServer module is not available");

    const app = req.server && req.server.app || req.app;
    if (app.apollo) {
      assert(ReactApollo,
        "Can\'t use Apollo because ReactApollo module is not available");

      const element = React.createElement(
        ReactApollo.ApolloProvider, {store, client: app.apollo},
        React.createElement(ReactRouter.RouterContext, match.renderProps)
      );
      return ReactApollo.getDataFromTree(element).then(() => {
        return (withIds
          ? ReactDomServer.renderToString
          : ReactDomServer.renderToStaticMarkup)(element);
      });
    } else {
      return (withIds
        ? ReactDomServer.renderToString
        : ReactDomServer.renderToStaticMarkup)(
        React.createElement(
          Provider, {store},
          React.createElement(ReactRouter.RouterContext, match.renderProps)
        )
      );
    }
  }
};

module.exports = renderToString;
