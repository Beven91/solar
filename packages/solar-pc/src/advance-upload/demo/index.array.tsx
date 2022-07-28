import React from 'react';
import { AdvanceUpload } from 'solar-pc';

export default function App() {
  const onUploaded = (value: string) => {
    console.log(value);
  };
  const value = { width: 300, url: 'aaa.jpg' };
  return (
    <div>
      <div className="flex-row">
        <AdvanceUpload onChange={onUploaded} valueMode="object" maxCount={3} value={value} />
      </div>
    </div>
  );
}