import React from 'react';
import { OptionsPicker } from 'solar-pc';

export default function App() {
  return (
    <div style={{ width: 300 }}>
      <OptionsPicker.OptionsView optionsKey="city" value="1" />
    </div>
  );
}