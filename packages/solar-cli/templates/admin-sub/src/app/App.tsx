
import React from 'react';
import { store } from '$projectName$-provider';
import { CrashProvider } from 'solar-pc';
import Router from './router';

const Provider = store.Provider;

export default function SubAdminApp() {
  return (
    <div style={{ height: '100%' }} className="$projectName$-sub-main">
      <Provider store={store.store}>
        <CrashProvider>
          <Router />
        </CrashProvider>
      </Provider>
    </div>
  );
}
