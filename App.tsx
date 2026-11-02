
import React from 'react';
import {Provider as ReduxProvider} from 'react-redux';
import AppNavigator from './src/navigation/AppNavigator';
import {store} from './src/store/store';
import QueryProvider from './src/providers/QueryProvider';

function App() {
  return (
    <ReduxProvider store={store}>
      <QueryProvider>
        <AppNavigator />
      </QueryProvider>
    </ReduxProvider>
  );
}

export default App;
