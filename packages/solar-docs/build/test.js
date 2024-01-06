const JavascriptParser = require('./parser');
const ReactTypescriptParser = require('./parser/ReactTypescriptParser');

async function main() {
  const componentPath = '/Users/admin/office/bilis/src/modules/jssdk/src/types.ts';
  const parser = new ReactTypescriptParser(componentPath)
  try {
    const item = {};
    const metadata = await parser.parse();
    // console.log(metadata);
    // const type = metadata.propType;
    // item.reasons = metadata.reasons;
    // console.log(type);
  } catch (ex) {
    console.log('@at', componentPath);
    throw ex;
  }
}

main();