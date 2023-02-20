import React, { useState } from 'react';
import { IconPicker } from 'solar-pc';

export default function App() {
  const [url, setUrl] = useState('https://at.alicdn.com/t/font_8d5l8fzk5b87iudi.css');

  return (
    <IconPicker.Input
      value={url}
      onChange={setUrl}
    />
  );
}