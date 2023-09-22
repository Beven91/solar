import React, { useState } from 'react';
import { AdvanceUpload } from 'solar-pc';

export default function App() {
  const [value, setValue] = useState(['doctorSubmit-c4f8322a15454f23950bb80b176bdde3.jpg']);

  const onUploaded = (value: string[]) => {
    setValue([...(value || [])]);
    console.log(value);
  };

  return (
    <div>
      <div className="flex-row">
        <div className="center">
          <AdvanceUpload maxCount={10} value={value} accept="*" multiple onChange={onUploaded} />
        </div>
      </div>
    </div>
  );
}