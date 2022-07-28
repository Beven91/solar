import React from 'react';
import { CrashProvider } from 'solar-pc';

function ChildApp(props:any) {
  return (
    <div>{props.a.b.c}</div>
  );
}

export default function App() {
  return (
    <CrashProvider>
      <ChildApp></ChildApp>
    </CrashProvider>
  );
}