import React, { useState } from 'react';
import { XlsxPicker, AbstractColumns, AbstractTable, XlsxMappings } from 'solar-pc';

interface DoctorModel {
  doctorId: string
  doctorName: string
  deparetment: string
}

export default function App() {
  // 转换映射
  const mappings: XlsxMappings = [
    {
      '医生ID': { name: 'doctorId' },
      '医生姓名': { name: 'doctorName' },
      '科室': { name: 'deparetment', format: (v)=>`A-${v}` },
    },
  ];

  const columns: AbstractColumns<DoctorModel> = [
    { title: '医生ID', name: 'doctorId' },
    { title: '医生名字', name: 'doctorName' },
    { title: '部门', name: 'deparetment' },
  ];

  const [doctors, setDoctors] = useState<DoctorModel[]>([]);

  return (
    <div>
      <XlsxPicker
        mappings={mappings}
        onChange={(data) => setDoctors(data[0])}
      />
      <AbstractTable
        rowKey="doctorId"
        columns={columns}
        data={{
          count: doctors.length,
          models: doctors,
        }}
      />
    </div>
  );
}