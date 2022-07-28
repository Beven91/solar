
import React from 'react';

export default class App extends React.Component {
  render() {
    return (
      <div style={styles.container}>
        Hello Background
      </div>
    );
  }
}

const styles = {
  container: {
    textAlign: 'center',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,
};
