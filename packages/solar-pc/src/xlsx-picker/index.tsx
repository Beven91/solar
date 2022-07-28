import React from 'react';
import { Button, Upload } from 'antd';
import { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import { ImportOutlined } from '@ant-design/icons';

const getXlsx = import(/* webpackChunkName: "xlsx.js" */'xlsx/dist/xlsx.full.min.js') as Promise<any>;

declare type Mappings = string[] | Record<string, CellMapping>

export type XlsxMappings = {
  [x:string]:CellMapping
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
  // 选择文件发生改变时触发
  onChange?: (data: any[][]) => void
}

export default class XlsxPicker extends React.Component<React.PropsWithChildren<XlsxPickerProps>> {
  static defaultProps: Partial<XlsxPickerProps> = {
    headerIndex: 0,
  };

  /**
   * 自定义上传
   */
  customRequest = async(options: RcCustomRequestOptions) => {
    const XLSX = await Promise.resolve(getXlsx);
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;
    const { onChange } = this.props;
    const file = options.file as any;
    reader.onload = (e) => {
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, { type: rABS ? 'binary' : 'array' });
      const wsnames = wb.SheetNames || [];
      const tables = [] as any[];
      wsnames.forEach((wsname: string, index: number) => {
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        tables.push(this.convert(data, index));
      });

      onChange && onChange(tables);
      options.onSuccess({}, null);
    };
    reader.onerror = (ex) => options.onError(new Error('读取失败'));
    if (rABS) reader.readAsBinaryString(file); else reader.readAsArrayBuffer(file);
  };

  getMappings(header: string[], mappings: Mappings): CellMapping[] {
    if (mappings instanceof Array) {
      return mappings.map((name) => {
        return {
          name: name,
        };
      });
    } else if (mappings) {
      return header.map((key) => {
        const mapping = mappings[key] || {};
        return {
          name: key,
          ...mapping,
        };
      });
    }
    return [];
  }

  convert(data: string[][], index: number) {
    console.log(data);
    const { headerIndex, mappings } = this.props;
    const models = [];
    const start = headerIndex < 0 ? 0 : headerIndex + 1;
    const header = data[headerIndex];
    const cellMappings = this.getMappings(header, (mappings || [])[index]);
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
  }

  render() {
    return (
      <Upload
        accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        customRequest={this.customRequest}
      >
        {this.props.children || <Button type="primary" icon={<ImportOutlined />}>导入</Button>}
      </Upload>
    );
  }
}