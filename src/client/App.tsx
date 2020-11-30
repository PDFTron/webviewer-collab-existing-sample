import React from 'react';
import DOM from 'react-dom';
import { ThemeProvider, CSSReset } from "@chakra-ui/core";
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import ClientContext from './context/client';

import Login from './pages/Login';
import View from './pages/View';
import SignUp from './pages/SignUp';
import Auth from './components/Auth';
import CollabClient from '@pdftron/collab-client';

const client = new CollabClient({
  url: `http://localhost:8000`,
  subscriptionUrl: `ws://localhost:8000/subscribe`,
});

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <ClientContext.Provider value={client}>
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
        </ClientContext.Provider>
      </ThemeProvider>
    </Router>
  )
}

DOM.render(<App />, document.getElementById('app'));