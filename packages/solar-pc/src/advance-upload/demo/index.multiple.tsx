import React, { useState } from 'react';
import { AdvanceUpload } from 'solar-pc';

export default function App() {
  const [value, setValue] = useState(['solar-ssss.jpg']);

  const onUploaded = (value: string[]) => {
    setValue([...(value || [])]);
    console.log(value);
  };

  return (
    <div>
      <div className="flex-row">
        <div className="center">
          <AdvanceUpload value={value} accept="*" multiple listType="text" onChange={onUploaded} />
        </div>
      </div>
    </div>
  );
}