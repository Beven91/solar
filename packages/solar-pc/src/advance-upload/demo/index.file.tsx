import React, { useState } from 'react';
import { AdvanceUpload } from 'solar-pc';

export default function App() {
  const [value, setValue] = useState<any>();
  return (
    <div>
      <div className="flex-row">
        <div className="center">
          <AdvanceUpload
            value={value}
            onChange={setValue}
            accept="*"
          />
        </div>
      </div>
    </div>
  );
}