import React from 'react';
import { AdvanceUpload } from 'solar-pc';

export default function App() {
  const onUploaded = (value: string) => {
    console.log(value);
  };
  return (
    <div style={{ width: 300 }}>
      <div className="flex-row">
        <AdvanceUpload onChange={onUploaded} valueMode="object" />
      </div>
    </div>
  );
}