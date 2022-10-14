/**
 * @name AdvanceUpload 文件上传列表组件
 * @description
 *       支持图片等资源上传，同时提供图片上传链接配置
 */
import './index.scss';
import React from 'react';
import { PlusOutlined, InboxOutlined } from '@ant-design/icons';
import { Upload, Button } from 'antd';
import { Oss, Rectangle } from 'solar-core';
import { getFileList, normalizeValue } from './helper';
import AbstractProvider from '../abstract-provider';
import { UploadChangeParam } from 'antd/lib/upload';
import { AdvanceUploadProps, FileList, UploadFileExtend, UploadedValueOrList } from './type';
import { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import { RcFile, UploadFile } from 'antd/lib/upload/interface';
import { AbstractUploadConfig } from '../interface';
import ItemPreview from './ItemPreview';

const Dragger = Upload.Dragger;

function noop() { }

export interface AdvanceUploadState {
  previewItem: UploadFile
  prevValue?: UploadedValueOrList
  fileList?: FileList
}

export default class AdvanceUpload extends React.Component<AdvanceUploadProps, AdvanceUploadState> {
  // 默认属性
  static defaultProps: AdvanceUploadProps = {
    maxCount: 1,
    acceptType: 'image',
    valueMode: 'url',
    multiple: false,
    name: 'file',
    bucketType: 'public',
    action: '',
    disabled: false,
    headers: {
      'X-Requested-With': null as any,
    },
    formatUrl: (key, props: AdvanceUploadProps) => {
      return Oss.getBucketAccessUrl(props.bucketType, key);
    },
    onChange: noop,
    withCredentials: true,
  };

  static getDerivedStateFromProps(props: AdvanceUploadProps, state: AdvanceUploadState) {
    if (props.value !== state.prevValue) {
      return {
        fileList: getFileList(props.value, props.formatUrl, state.fileList, props),
        prevValue: props.value,
      };
    }
    return null;
  }

  // 状态
  state: AdvanceUploadState = {
    previewItem: null as UploadFile,
    fileList: [] as FileList,
  };

  // 上传文件前，进行文件大小验证
  beforeUpload = (file: RcFile, files: RcFile[], config: AbstractUploadConfig) => {
    if (this.props.selectOnly) {
      return false;
    }
    if (this.props.beforeUpload) {
      return this.props.beforeUpload(file, files);
    }
    return true;
  };

  // 取消冒泡
  stopPropagation(e: React.DragEvent<HTMLDivElement>) {
    e.stopPropagation();
  }

  /**
   * 取消图片放大预览
   */
  handleCancelPreview = () => {
    this.setState({ previewItem: null });
  };

  /**
   * 预览图片
   */
  handlePreview = (file: UploadFile) => {
    this.setState({
      previewItem: file,
    });
  };

  /**
   * 处理文件变动
   */
  handleChange = (data: UploadChangeParam) => {
    const list = data.fileList as FileList;
    const props = this.props;
    if (this.props.selectOnly) {
      const isSingle = props.maxCount === 1 && !props.multiple;
      const value = isSingle ? list[0] : list;
      const { onChange } = this.props;
      this.setState({ fileList: [...list] });
      onChange && onChange(value, list);
    } else {
      this.setState({ fileList: [...list] }, () => this.handleQueues(list));
    }
  };

  /**
   * 执行文件队列
   */
  async handleQueues(fileList: FileList) {
    const { onChange } = this.props;
    const uploading = fileList.filter((m) => m.status === 'uploading');
    const needRectFiles = fileList.filter((m) => !(m.width > 0));
    // const errors = fileList.filter((m) => m.status === 'error');
    if (uploading.length > 0) {
      return this.setState({ fileList });
    }
    await Rectangle
      .getRectangles(needRectFiles.map((m) => m.originFileObj) as any)
      .then((rects) => {
        needRectFiles.forEach((item: UploadFileExtend, index: number) => {
          const rect = rects[index] as UploadFileExtend;
          item.width = rect.width;
          item.height = rect.height;
        });
      });
    const value = normalizeValue([...fileList], this.props);
    onChange && onChange(value, fileList);
    fileList.forEach((f) => {
      if (f.status == 'error') {
        f.url = f.status == 'error' ? '' : f.url;
        delete f.originFileObj;
      }
    });
    this.setState({
      fileList: [
        ...fileList,
      ],
    });
  }

  async handleRemove<T>(f: UploadFileExtend, onRemove: (file: UploadFile<T>) => void | boolean | Promise<void | boolean>) {
    await Promise.resolve(onRemove && onRemove(f));
    const fileList = this.state.fileList;
    const index = fileList.indexOf(f);
    const { onChange } = this.props;
    if (index >= 0) {
      fileList.splice(index, 1);
    }
    this.setState({ fileList });
    const value = normalizeValue(fileList, this.props);
    onChange && onChange(value, fileList);
  }

  defaultUploadToServer = async(context: RcCustomRequestOptions) => {
    const onProgress = (percent: number) => context.onProgress({ percent });
    const { bucketType, dir } = this.props;
    const data = await Oss.uploadToAliOss(context.file as File, { category: dir, bucketType }, onProgress);
    if (data.success) {
      return data.result;
    }
    return Promise.reject(new Error(data.errorMsg));
  };

  checkUpload(file: File, config: AbstractUploadConfig) {
    const defaultMax = 3 * 1024 * 1024;
    const media = config?.media || AbstractProvider.defaultMediaDefinitions;
    const data = media[this.props.acceptType] || { max: defaultMax };
    const max = this.props.maxSize || data.max || defaultMax;
    const isLt = file.size < max;
    if (!isLt) {
      const value = max / (1024 * 1024);
      return new Error(`上传不能超过 ${value}MB!`);
    }
  }

  /**
   * 上传图片
   */
  uploadRequest = (context: RcCustomRequestOptions, config: AbstractUploadConfig) => {
    const error = this.checkUpload(context.file as File, config);
    if (error) {
      return this.handleError(error, context);
    }
    const uploadRequest = config?.onUpload || this.defaultUploadToServer;
    if (typeof uploadRequest === 'function') {
      Promise
        .resolve(uploadRequest(context, config))
        .then((key: string) => {
          const item2 = context.file as any;
          const item = this.state.fileList.find((m) => m.uid == item2.uid);
          item.status = 'done';
          item.url = key;
          context.onSuccess(item, null);
        })
        .catch((ex) => {
          this.handleError(ex, context);
        });
    }
  };

  handleError(error: Error, context: RcCustomRequestOptions) {
    setTimeout(() => {
      const item2 = context.file as any;
      const item = this.state.fileList.find((m) => m.uid == item2.uid);
      item.status = 'error';
      item.error = error;
      context.onError(error, error);
    }, 20);
  }

  // 渲染拖拽上传按钮
  renderUploadButton() {
    const { children, listType } = this.props;
    if (children) {
      return children;
    }
    if (listType == 'text') {
      return (
        <Button type="primary">
          <PlusOutlined />
          {this.props.uploadText || '浏览...'}
        </Button>
      );
    }
    return (
      <div className="default-upload-btn">
        <PlusOutlined />
        <div className="ant-upload-text">{this.props.uploadText || '上传'}</div>
      </div>
    );
  }

  // 渲染拖拽上传按钮
  renderDraggerUpload() {
    return (
      <div className="dragger-button">
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <div className="ant-upload-text">{this.props.uploadText || '点击或者拖拽文件到此区域,进行文件上传'}</div>
      </div>
    );
  }

  // 渲染视图
  render() {
    const { fileList } = this.state;
    const { maxCount, disabled, data, type, accept, acceptType, ...props } = this.props;
    const showUpload = !(fileList.length >= maxCount || disabled === true);
    const single = maxCount <= 1;
    const dragger = type === 'drag';
    const UploadFile = dragger ? Dragger : Upload;
    const uploadButton = dragger ? this.renderDraggerUpload() : this.renderUploadButton();
    const topClass = this.props.children ? 'has-children' : '';
    return (
      <AbstractProvider.Consumer>
        {
          (config) => {
            const media = config?.upload?.media || AbstractProvider.defaultMediaDefinitions;
            const realAccept = accept || media[acceptType]?.accept || '';
            return (
              <div
                className={`clearfix advance-upload ${topClass} ${single ? 'single' : 'multiple'} ${this.props.className}`}
              >
                <div
                  onDragStart={this.stopPropagation}
                  onDragOver={this.stopPropagation}
                >
                  <UploadFile
                    data={data}
                    className={`${acceptType} ${dragger ? 'dragger' : ''} ${showUpload ? 'show' : 'upload-hide'}`}
                    fileList={fileList}
                    disabled={disabled}
                    listType="picture-card"
                    customRequest={(context) => this.uploadRequest(context, config.upload)}
                    {...props}
                    accept={realAccept}
                    onRemove={(f) => this.handleRemove(f as UploadFileExtend, config.upload?.onRemove || props.onRemove)}
                    beforeUpload={(file: RcFile, files: RcFile[]) => this.beforeUpload(file, files, config.upload)}
                    onPreview={this.handlePreview}
                    onChange={this.handleChange}
                  >
                    {showUpload ? uploadButton : null}
                  </UploadFile>
                </div>
                <ItemPreview
                  onCancel={this.handleCancelPreview}
                  accept={realAccept}
                  config={config}
                  file={this.state.previewItem}
                />
              </div>
            );
          }
        }
      </AbstractProvider.Consumer>
    );
  }
}

