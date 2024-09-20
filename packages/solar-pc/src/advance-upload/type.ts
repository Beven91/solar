import type { UploadProps, UploadFile } from 'antd/lib/upload/interface';
import { FileGatewayOptions } from 'solar-core/src/config';
import type { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import type React from 'react';
import type { AbstractUploadConfig } from '../interface';

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

export interface AdvanceUploadProps<T = any> extends Omit<UploadProps<T>, 'onChange' | 'customRequest'> {
  /**
   * 上传文件模式：
   * private: 私有云
   * public:  公有云
   **/
  bucketType?: 'private' | 'public'
  // 是否保留原始名字上传,注意指定次参数后，还需要设定storeDir参数
  sameKeep?: boolean
  // 上传参数
  params?: Partial<FileGatewayOptions>
  // 再设置了sameKeep后需要指定文件的存放目录
  storeDir?: string
  // 业务id
  bizId?: string
  // 值模式
  valueMode?: 'url' | 'object'
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
  // 选择模式, 不进行上传，仅选择文件
  selectOnly?: boolean
  // 是否返回完整url
  returnAbsolute?: boolean
  // 自定义上传
  customRequest?: (options: RcCustomRequestOptions, config: AbstractUploadConfig) => Promise<string>
  // 是否冒泡： 默认情况下会关闭drag的冒泡
  propagation?: boolean
  // 是否开启选择文件后格式校验
  checkAfterAccept?: boolean
  // 格式校验失败的提示文案
  acceptInvalidMessage?: string
  // 预览配置
  previewOptions?: import('rc-image/lib/PreviewGroup').PreviewGroupPreview
  // 自定义预览
  customPreview?: AbstractUploadConfig['onPreview']
}

export type ProcessUploadInterceptor = (type: string, file: UploadFileExtend, props: AdvanceUploadProps) => Promise<any>
