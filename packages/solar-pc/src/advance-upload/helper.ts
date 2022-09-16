import memoize from 'memoize-one';
import { AdvanceUploadProps, FileList, UploadedValueOrList, UploadFileValue } from './type';

/**
 * 返回标准的filelist
 */
export const getFileList = memoize((value, format, fileList, props: AdvanceUploadProps) => {
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
      url: url,
      name: key.split('/').pop(),
      key: key,
      width: item.width,
      height: item.height,
      config: item.config || {},
      type: item.type,
      thumbUrl: url,
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
  if (props.maxCount === 1) {
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
    width: response.width,
    height: response.height,
    config: item.config,
    type: item.type,
  };
}
