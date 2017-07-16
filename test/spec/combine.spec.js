"use strict";

const createStore = require("redux").createStore;
const combineReducers = require("redux").combineReducers;
const ApolloClient = require("react-apollo").ApolloClient;

const {combineReducerWithApollo} = require("../..");

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

describe("Combine reducer with Apollo", function () {

    it("should combine existing root reducer", () => {
        const client = new ApolloClient();

        const rootReducer = combineReducers({
            checkBox,
            number
        });

        const initialState = {
            checkBox: {checked: false},
            number: {value: 999}
        };
        const store = createStore(combineReducerWithApollo(rootReducer, client), initialState);
        expect(store.getState()).to.have.all.keys("checkBox", "number", "apollo");
        expect(store.getState().checkBox).to.deep.equal({checked: false});
        expect(store.getState().number).to.deep.equal({value: 999});

        store.dispatch({type: "TOGGLE_CHECK"});
        expect(store.getState().checkBox).to.deep.equal({checked: true});
        store.dispatch({type: "TOGGLE_CHECK"});
        expect(store.getState().checkBox).to.deep.equal({checked: false});

        store.dispatch({type: "INC_NUMBER"});
        expect(store.getState().number).to.deep.equal({value: 1000});
        store.dispatch({type: "DEC_NUMBER"});
        expect(store.getState().number).to.deep.equal({value: 999});
    });
});
