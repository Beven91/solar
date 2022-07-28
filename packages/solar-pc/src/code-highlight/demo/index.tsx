import React from 'react';
import { CodeHighlight } from 'solar-pc';

const code = `
import React from 'react';
import { CodeHighlight } from 'solar-pc';

export default function App() {
  return <CodeHighlight code={code} />;
}
`;

export default function App() {
  return <CodeHighlight language="tsx" code={code} />;
}