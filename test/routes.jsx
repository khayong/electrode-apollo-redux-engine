import React from "react";
import { Route } from "react-router";

class Page extends React.Component {
  render() {
    return <div>Page</div>;
  }
}

export default (
  <Route path="/test" component={Page}>
  </Route>
);
