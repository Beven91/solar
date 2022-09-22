import React from 'react';

export default class VirtualInput extends React.Component<React.PropsWithChildren> {
  render() {
    return (
      <React.Fragment>
        {this.props.children}
      </React.Fragment>
    );
  }
}
