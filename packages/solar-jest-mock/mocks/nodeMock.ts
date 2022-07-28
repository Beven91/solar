
import path from 'path';
import fs from 'fs';

export default function createNodeMock(node: any) {
  const file = path.join(__dirname, 'elements', node.type + '-mock.js');
  if (fs.existsSync(file)) {
    return require(file)(node);
  }
  return {
    addEventListener: jest.fn(),
  };
}
