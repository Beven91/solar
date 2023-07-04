/**
 * @module ItemPreview
 * @description 预览指定项
 */
import React, { useContext, useMemo } from 'react';
import { UploadFile } from 'antd/lib/upload/interface';
import { Image } from 'antd';
import AbstractProvider from '../abstract-provider';
import { FileList } from './type';

const imgExtRegexp = /\.(jpg|png|gif|jpeg|bmp|webp|ico)/;

export interface ItemPreviewProps {
  onCancel: () => void
  file: UploadFile
  fileList: FileList
  accept: string
  formatUrl: (key: string) => string
}

export default function ItemPreview(props: ItemPreviewProps) {
  const { fileList, file, accept } = props;
  const url = file?.response?.url || file?.url || file?.thumbUrl;
  const onCancel = () => props.onCancel?.();
  const config = useContext(AbstractProvider.Context);

  const urls = useMemo(() => {
    return fileList.map((item) => {
      const url = item?.response?.url || item?.url || item?.thumbUrl;
      return url as string;
    });
  }, [fileList]);

  const defaultPreview = () => {
    const isImage = imgExtRegexp.test(url) || /image/.test(accept);
    if (!isImage) {
      setTimeout(onCancel, 20);
      window.open(url);
      return;
    }
    return (
      <Image.PreviewGroup
        preview={{ current: urls.indexOf(url), onVisibleChange: onCancel, visible: true }}
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
  if (config?.upload?.onPreview) {
    return config.upload.onPreview(url, accept, onCancel, urls, defaultPreview) as React.ReactElement;
  }

  return defaultPreview();
}