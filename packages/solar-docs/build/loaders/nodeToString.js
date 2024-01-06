const babelGenerator = require('@babel/generator').default;

module.exports = function nodeToString(node) {
  const res = babelGenerator(node, {
    filename: 'a.js',
    retainLines: false,
    jsonCompatibleStrings: true,
    jsescOption: {
      quotes: 'single',
      wrap: true,
    }
  });
  return res.code.replace(/\n+/, '').replace(/^:\s*/, '').replace(/(\(\{|=>\s\{})/g, '$1\n').replace(/(\/\/)/g,'\n  $1').replace(/\n\n/g, '\n');
}