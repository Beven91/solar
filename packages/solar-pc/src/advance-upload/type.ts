import { UploadProps, UploadFile } from 'antd/lib/upload/interface';
import React from 'react';

export interface UploadFileExtend extends UploadFile {
  url: string
  width?: number
  height?: number
  config?: any
}

export interface UploadFileValue extends Partial<UploadFile> {
  url: string
  key?: string
  width?: number
  height?: number
  config?: any
}

export type UploadedValue = string | UploadFileValue

export type UploadedValueOrList = Array<UploadedValue> | UploadedValue

export type FileList = Array<UploadFileExtend>

export interface AdvanceUploadProps<T = any> extends Omit<UploadProps<T>, 'onChange'> {
  /**
   * 上传文件模式：
   * private: 私有云
   * public:  公有云
   **/
  bucketType: 'private' | 'public'
  // 上传目录
  dir?: string
  // 值模式
  valueMode: 'url' | 'object'
  // 最多能上传的文件张数
  maxCount?: number
  // 最大上传大小 单位： 字节
  maxSize?: number
  // 文件数组
  value?: UploadedValueOrList
  // 上传文件发生变化
  onChange?: (value: UploadedValueOrList, fileList?: FileList) => void
  // 是否禁用
  disabled?: boolean
  // 发到后台的文件参数名
  name?: string,
  // 是否多选
  multiple?: boolean
  // 自定义url格式化
  formatUrl?: (key: string, props: AdvanceUploadProps) => string
  // 设定上传的媒体类型
  acceptType?: 'image' | 'audio' | 'video'
  // 上传按钮文案
  uploadText?: React.ReactNode
}
