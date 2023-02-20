/**
 * @module ItemPreview
 * @description 预览指定项
 */
import React, { useContext, useMemo } from 'react';
import { UploadFile } from 'antd/lib/upload/interface';
import { Image } from 'antd';
import AbstractProvider from '../abstract-provider';
import { FileList } from './type';

export interface ItemPreviewProps {
  onCancel: () => void
  file: UploadFile
  fileList: FileList
  accept: string
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
    if (/\.pdf/.test(url) || /pdf/.test(accept)) {
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
            return <Image key={index} src={url} style={{ display: 'none' }} />;
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