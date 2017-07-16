"use strict";

const createStore = require("redux").createStore;
const combineReducers = require("redux").combineReducers;
const ApolloClient = require("react-apollo").ApolloClient;
const ReduxRouterEngine = require("electrode-redux-router-engine");

const {combineReducerWithApollo} = require("../..");
const {renderToString} = require("../../server");

require("babel-register");

const routes = require("../routes.jsx").default;

const checkBox = (store, action) => {
    if (action.type === "TOGGLE_CHECK") {
        return {
            checked: !store.checked
        };
    }

    return store || {checked: false};
};

const number = (store, action) => {
    if (action.type === "INC_NUMBER") {
        return {
            value: store.value + 1
        };
    } else if (action.type === "DEC_NUMBER") {
        return {
            value: store.value - 1
        };
    }

    return store || {value: 0};
};

const getPrefetchState = (prefetch) => {
    const regex = /^window.__PRELOADED_STATE__ = (.*);$/g;
    return JSON.parse(regex.exec(prefetch)[1]);
};

describe("Server rendering with Apollo", function () {

    it("should render to string without apollo", () => {
        const rootReducer = combineReducers({
            checkBox,
            number
        });
        const createReduxStore = (req, match) => { // eslint-disable-line
            const initialState = {
                checkBox: {checked: false},
                number: {value: 999}
            };
            const store = createStore(rootReducer, initialState);
            return Promise.resolve(store);
        };
        const testReq = {
            method: "get",
            log: () => {
            },
            app: {},
            url: {
                path: "/test"
            }
        };

        const engine = new ReduxRouterEngine({routes, createReduxStore, renderToString});
        return engine.render(testReq).then(result => {
            expect(getPrefetchState(result.prefetch)).to.deep.equal({checkBox: {checked: false}, number: {value: 999}});
        });
    });

    it("should render to string with apollo", () => {
        const client = new ApolloClient();

        const rootReducer = combineReducers({
            checkBox,
            number
        });
        const createReduxStore = (req, match) => { // eslint-disable-line
            const initialState = {
                checkBox: {checked: false},
                number: {value: 999}
            };
            const store = createStore(combineReducerWithApollo(rootReducer, client), initialState);
            return Promise.resolve(store);
        };
        const testReq = {
            method: "get",
            log: () => {
            },
            app: {
                apollo: client
            },
            url: {
                path: "/test"
            }
        };

        const engine = new ReduxRouterEngine({routes, createReduxStore, renderToString});
        return engine.render(testReq).then(result => {
            expect(getPrefetchState(result.prefetch)).to.have.all.keys(["checkBox", "number", "apollo"]);
        });
    });
});
