import React from 'react';
import { IconPicker } from 'solar-pc';

export default function App() {
  const onChange = (value:string)=>{
    console.log('选择值:', value);
  };

  return (
    <IconPicker
      value="icon-facebook"
      onChange={onChange}
      allowClear
      url="https://at.alicdn.com/t/font_8d5l8fzk5b87iudi.css"
    />
  );
}