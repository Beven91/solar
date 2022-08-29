import React from 'react';

export default class App extends React.Component {
  constructor(props: any) {
    super(props);
    chrome.devtools.panels.create('Chrome-Demo-DevTool', null, 'index.html#dev-tools-tab');
    chrome.devtools.network.onRequestFinished.addListener(response => {
      response.getContent(function(result) {
        chrome.extension.sendMessage({ greeting: result });
      });
    });
  }

  render() {
    return <div>Hello Dev-Tools</div>;
  }
}
