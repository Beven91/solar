import React, { useState } from 'react';
import { AdvanceUpload } from 'solar-pc';

export default function App() {
  const [value, setValue] = useState<any>();
  console.log(value);
  return (
    <div>
      <div className="flex-row">
        <div className="center">
          <AdvanceUpload
            value={value}
            onChange={setValue}
            selectOnly
          />
        </div>
      </div>
    </div>
  );
}