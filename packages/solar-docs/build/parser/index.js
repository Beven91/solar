const fs = require('fs');
const ReactTypescriptParser = require('./ReactTypescriptParser');
const { probeApp } = require('../loaders/vendor-loader/index');

class JavascriptParser {
  createParser(file) {
    const source = fs.readFileSync(file).toString('utf-8');
    const type = probeApp(source);
    switch (type) {
      case 'react':
        return new ReactTypescriptParser(file);
      default:
        return null;
    }
  }

  async parseComponentProps(file) {
    try {
      const parser = this.createParser(file);
      if (parser) {
        return parser.parseComponentProps();
      }
      return { interfaces: {} };
    } catch (ex) {
      console.error(ex);
      return { interfaces: {} };
    }
  }
}

module.exports = JavascriptParser;