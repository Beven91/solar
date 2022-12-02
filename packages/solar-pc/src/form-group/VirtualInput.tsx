import React from 'react';

export default class VirtualInput extends React.Component<React.PropsWithChildren<any>> {
  render() {
    return (
      <React.Fragment>
        {this.props.children}
      </React.Fragment>
    );
  }
}
