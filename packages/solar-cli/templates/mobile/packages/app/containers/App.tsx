import './css/index.scss';
import React from 'react';
import { CrashProvider } from 'solar-mobile';
import Router from './router';

export default class App extends React.Component {
  render() {
    return (
      <div className="top-container">
        <CrashProvider>
          <Router />
        </CrashProvider>
      </div>
    );
  }
}