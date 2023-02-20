import React, { useCallback, useEffect } from 'react';
import { Button, Upload } from 'antd';
import { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import { ImportOutlined } from '@ant-design/icons';

const getXlsx = () => import(/* webpackChunkName: "xlsx.js" */'xlsx/dist/xlsx.full.min.js') as Promise<any>;

declare type Mappings = string[] | Record<string, CellMapping>

export type XlsxMappings = {
  [x: string]: CellMapping
}[]

export interface CellMapping {
  // 对应列名要转换成的属性名
  name: string
  // 自定义格式化指定单元格的值
  format?: (v: string) => any
}

export interface XlsxPickerProps {
  // 列所在行号，如果没有行号，请设定值为 -1
  headerIndex?: number
  // 属性映射
  mappings: Mappings[]
  // 是否预加载xlsx.js
  preload?: boolean
  // 选择文件发生改变时触发
  onChange?: (data: any[][]) => void
}

const getMappings = (header: string[], mappings: Mappings): CellMapping[] => {
  if (mappings instanceof Array) {
    return mappings.map((name) => ({ name }));
  } else if (mappings) {
    return header.map((key) => {
      return { name: key, ...(mappings[key] || {}) };
    });
  }
  return [];
};

const convertToJSON = (data: string[][], index: number, mappings: Mappings[], headerIndex: number) => {
  const models = [];
  const start = headerIndex < 0 ? 0 : headerIndex + 1;
  const header = data[headerIndex];
  const cellMappings = getMappings(header, (mappings || [])[index]);
  for (let i = start, k = data.length; i < k; i++) {
    const cells = data[i];
    const row = {} as Record<string, any>;
    models.push(row);
    cells.forEach((value, cellIndex) => {
      const mapping = cellMappings[cellIndex] || { name: cellIndex.toString() } as CellMapping;
      row[mapping.name] = mapping.format ? mapping.format(value) : value;
    });
  }
  return models;
};

export default function XlsxPicker({ headerIndex = 0, mappings, ...props }: React.PropsWithChildren<XlsxPickerProps>) {
  const customRequest = useCallback(async(options: RcCustomRequestOptions) => {
    const XLSX = await Promise.resolve(getXlsx());
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;
    const file = options.file as any;
    reader.onload = (e) => {
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, { type: rABS ? 'binary' : 'array' });
      const wsnames = wb.SheetNames || [];
      const tables = [] as any[];
      wsnames.forEach((wsname: string, index: number) => {
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        tables.push(convertToJSON(data, index, mappings, headerIndex));
      });

      props.onChange && props.onChange(tables);
      options.onSuccess({}, null);
    };
    reader.onerror = (ex) => options.onError(new Error('读取失败'));
    if (rABS) reader.readAsBinaryString(file); else reader.readAsArrayBuffer(file);
  }, [props.onChange, mappings, headerIndex]);

  useEffect(() => {
    if (props.preload) {
      getXlsx();
    }
  }, []);


  return (
    <Upload
      accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      customRequest={customRequest}
    >
      {props.children || <Button type="primary" icon={<ImportOutlined />}>导入</Button>}
    </Upload>
  );
}