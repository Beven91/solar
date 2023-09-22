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
          <AdvanceUpload sameKeep storeDir="" onChange={onUploaded} value="doctorSubmit-c4f8322a15454f23950bb80b176bdde3.jpg" />
          <h5>共有云</h5>
        </div>
        <div className="center">
          <AdvanceUpload bucketType="private" value="doctorSubmit-248947b4f7bc44d69df9be83d7e8ee76.jpg" />
          <h5>私有云</h5>
        </div>
      </div>
    </div>
  );
}