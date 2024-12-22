/**
 * @module ItemPreview
 * @description 预览指定项
 */
import React, { useEffect, useMemo, useState } from 'react';
import { UploadFile } from 'antd/lib/upload/interface';
import { Image } from 'antd';
import { FileList } from './type';
import { AbstractUploadConfig } from '../interface';

const imgExtRegexp = /\.(jpg|png|gif|jpeg|bmp|webp|ico)/;

export interface ItemPreviewProps {
  onCancel: () => void
  file: UploadFile
  fileList: FileList
  accept: string
  formatUrl: (key: string) => string
  onPreview?: AbstractUploadConfig['onPreview'],
  previewOptions?: any
}

export default function ItemPreview(props: ItemPreviewProps) {
  const { fileList, file, accept } = props;
  const url = file?.response?.url || file?.url || file?.thumbUrl;
  const onCancel = () => props.onCancel?.();

  const urls = useMemo(() => {
    return fileList.map((item) => {
      const url = item?.response?.url || item?.url || item?.thumbUrl;
      return url as string;
    });
  }, [fileList]);

  const [current, setCurrent] = useState(urls.indexOf(url));
  const isImage = imgExtRegexp.test(url) || /image/.test(accept);

  useEffect(()=>{
    setCurrent(urls.indexOf(url));
  }, [url]);

  const defaultPreview = () => {
    if (!isImage) {
      setTimeout(onCancel, 20);
      window.open(url);
      return;
    }
    return (
      <Image.PreviewGroup
        preview={{
          ...(props.previewOptions || {}),
          current: current,
          onChange: setCurrent,
          onVisibleChange: onCancel,
          visible: true,
        }}
      >
        {
          urls.map((url, index) => {
            const absUrl = props.formatUrl ? props.formatUrl(url) : url;
            return <Image key={index} src={absUrl} style={{ display: 'none' }} />;
          })
        }
      </Image.PreviewGroup>
    );
  };

  if (!file) return null;
  if (props?.onPreview) {
    return props.onPreview(url, accept, onCancel, urls, defaultPreview, isImage) as React.ReactElement;
  }

  return defaultPreview();
}