import React, { } from 'react';

export interface AbstractUpdaterProps {
  needForceUpdate?: () => boolean
}

export default class AbstractUpdater extends React.Component<React.PropsWithChildren<AbstractUpdaterProps>> {
  reason = '';

  noticeUpdater() {
    this.reason = 'change';
  }

  shouldComponentUpdate(): boolean {
    if (this.props.needForceUpdate?.() === true) {
      return true;
    }
    if (this.reason == 'change') {
      this.reason = '';
      return false;
    }
    return true;
  }

  render(): React.ReactNode {
    return (
      <>
        {this.props.children}
      </>
    );
  }
}