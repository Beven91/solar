import React from 'react';
import { AdvanceUpload } from 'solar-pc';

export default function App() {
  const onUploaded = (value: string) => {
    console.log(value);
  };
  return (
    <div>
      <div className="flex-row">
        <div className="center">
          <AdvanceUpload onChange={onUploaded} value="aaa.jpg" />
          <h5>共有云</h5>
        </div>
        <div className="center">
          <AdvanceUpload bucketType="private" value="aaa.jpg" />
          <h5>私有云</h5>
        </div>
      </div>
    </div>
  );
}