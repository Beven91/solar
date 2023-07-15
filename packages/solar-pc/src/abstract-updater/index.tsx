import React, { PropsWithChildren } from 'react';

export default class AbstractUpdater extends React.Component<PropsWithChildren> {
  reason = '';

  noticeUpdater() {
    this.reason = 'change';
  }

  shouldComponentUpdate(): boolean {
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