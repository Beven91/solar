/**
 * @module ItemPreview
 * @description 预览指定项
 */
import React from 'react';
import { AbstractConfig } from '../interface';
import { UploadFile } from 'antd/lib/upload/interface';
import { Image } from 'antd';

const mapping = {
  image: /\.(png|jpg|jpeg|gif|bmp|webp)$/,
};

export interface ItemPreviewProps {
  onCancel:()=>void
  config:AbstractConfig
  file:UploadFile
  accept:string
}

export interface ItemPreviewState {

}

export default class ItemPreview extends React.Component<ItemPreviewProps, ItemPreviewState> {
  onCancel = ()=>{
    this.props?.onCancel();
  };

  // 默认渲染预览
  renderDefaultPreview(url:string, accept:string) {
    if (/image/.test(accept) || mapping.image.test(url)) {
      return (
        <Image.PreviewGroup
          preview={{ onVisibleChange: this.onCancel, visible: true }}
        >
          <Image src={url} style={{ display: 'none' }} />
        </Image.PreviewGroup>
      );
    }
    this.onCancel();
  }

  render() {
    const { config, file, accept } = this.props;
    const url = file?.url || file?.thumbUrl;
    if (!file) return '';
    if (config?.upload?.onPreview) {
      return config.upload.onPreview(url, accept, this.onCancel);
    }
    return this.renderDefaultPreview(url, accept);
  }
}