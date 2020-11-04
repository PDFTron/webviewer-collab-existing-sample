import React from 'react';
import DOM from 'react-dom';
import { ThemeProvider, CSSReset } from "@chakra-ui/core";
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import Login from './pages/Login';
import View from './pages/View';
import SignUp from './pages/SignUp';
import Auth from './components/Auth';

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <Auth>
          <CSSReset />
          <div className='app'>

            <Switch>
              <Route path='/login'>
                <Login />
              </Route>

              <Route path='/sign-up'>
                <SignUp />
              </Route>

              <Route path={['/:id', '/']}>
                <View />
              </Route>
            </Switch>
          </div>
        </Auth>
      </ThemeProvider>
    </Router>
  )
}

DOM.render(<App />, document.getElementById('app'));