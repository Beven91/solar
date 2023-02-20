import { UploadFile } from 'antd';
import { Rectangle } from 'solar-core';
import memoize from 'memoize-one';
import AbstractProvider from '../abstract-provider';
import { AbstractUploadConfig } from '../interface';
import { AdvanceUploadProps, FileList, ProcessUploadInterceptor, UploadedValueOrList, UploadFileExtend, UploadFileValue } from './type';

export const getFileList = memoize((value, format, fileList, props: AdvanceUploadProps): FileList => {
  value = value instanceof Array ? value : value ? [value] : [];
  if (props.selectOnly) {
    return [...value];
  }
  const items = fileList?.length > value.length ? fileList : value;
  const normalize = (url: any) => typeof url === 'string' ? { url } : (url || {});
  return items.map((a: UploadedValueOrList, i: number) => {
    const v = value[i];
    const item = normalize(v) as UploadFileValue;
    const key = item.url || '';
    const url = format ? format(key, props) : key;
    const oItem = fileList[i] || {};
    return {
      uid: oItem.uid || -i,
      originFileObj: oItem.originFileObj,
      status: oItem.status || 'done',
      error: oItem.error || '',
      url: url,
      name: key.split('/').pop(),
      key: key,
      width: item.width,
      height: item.height,
      config: item.config || {},
      thumbUrl: url,
      type: item.type,
    } as UploadFileValue;
  }).filter((m: any) => !!m.url || m.status === 'error') as FileList;
});

/**
 * 获取上传组件onChange时的值列表
 */
export const normalizeValue = (fileList: FileList, props: AdvanceUploadProps) => {
  const isObj = props.valueMode === 'object';
  fileList = (fileList || []).filter((m) => m.status !== 'error');
  if (!fileList || fileList.length < 1) {
    return null;
  }
  if (props.maxCount === 1 && !props.multiple) {
    const item = fileList[0];
    const res = item ? item.response || item : {};
    const url = res.key || res.url;
    return isObj ? createAdvanceObj(url, item) : url;
  }
  return fileList.map((m) => {
    const res = m.response || m;
    const url = res.url;
    return isObj ? createAdvanceObj(url, m) : url;
  });
};

// 获取高级模式对象
function createAdvanceObj(url: string, item: UploadFileValue) {
  item = item || {} as UploadFileValue;
  const response = item.response || item;
  return {
    url: response.key || response.url,
    name: item.name,
    width: response.width || item.width,
    height: response.height || item.height,
    config: item.config,
    type: item.type,
  };
}

export const stopPropagation = (e: React.DragEvent<HTMLDivElement>) => e.stopPropagation();

export const getExtension = (type: string, path: string) => {
  const [id, name] = (type || '').toString().split('/');
  const ext = (path || '').split('.').pop();
  const useExt = (ext || name);
  switch (id.toLowerCase()) {
    case 'image':
      return '.jpg';
    default:
      return '.' + useExt;
  }
};

export const checkUpload = (file: File, acceptType: AdvanceUploadProps['acceptType'], maxSize: number, config: AbstractUploadConfig) => {
  const defaultMax = 3 * 1024 * 1024;
  const media = config?.media || AbstractProvider.defaultMediaDefinitions;
  const data = media[acceptType] || { max: defaultMax };
  const max = maxSize || data.max || defaultMax;
  const isLt = file.size < max;
  if (!isLt) {
    const value = max / (1024 * 1024);
    return new Error(`上传不能超过 ${value}MB!`);
  }
};

const interceptors: ProcessUploadInterceptor[] = [
  // 获取上传图片宽度与高度
  async(type, item, props) => {
    const file = item.originFileObj;
    if (file instanceof File && props.valueMode == 'object' && /image\//.test(type) && !(item.width > 0)) {
      const result = await Rectangle.getRectangle(item.originFileObj);
      item.width = result.width;
      item.height = result.height;
    }
  },
];

export const processUploadInteceptors = async(fileList: UploadFile[], props: AdvanceUploadProps) => {
  fileList = fileList || [];
  for (let i = 0, k = fileList.length; i < k; i++) {
    const item = fileList[i];
    if (!item.originFileObj) continue;
    for (let j = 0, m = interceptors.length; j < m; j++) {
      await interceptors[j](item.originFileObj.type, item as UploadFileExtend, props);
    }
  }
};