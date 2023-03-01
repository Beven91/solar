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
          <AdvanceUpload bucketType="private" params={{ web: true }} onChange={onUploaded} value="" />
          <h5>大文件web直传私有云</h5>
        </div>
      </div>
    </div>
  );
}