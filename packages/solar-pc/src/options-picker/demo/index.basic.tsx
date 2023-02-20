import React, { useState } from 'react';
import { OptionsPicker } from 'solar-pc';

export default function App() {
  const [value, setValue] = useState('1');
  return (
    <div style={{ width: 300 }}>
      <OptionsPicker value={value} optionsKey="city" onChange={setValue} />
    </div>
  );
}