/**
 * @name AdvanceUpload 文件上传列表组件
 * @description
 *       支持图片等资源上传，同时提供图片上传链接配置
 */
import './index.scss';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { PlusOutlined, InboxOutlined } from '@ant-design/icons';
import { Upload, Button, ConfigProvider, message } from 'antd';
import { Oss } from 'solar-core';
import { checkUpload, getExtension, getFileList, normalizeValue, processUploadInteceptors, stopPropagation } from './helper';
import AbstractProvider from '../abstract-provider';
import { UploadChangeParam } from 'antd/lib/upload';
import { AdvanceUploadProps, UploadFileExtend, UploadFileValue, FileList } from './type';
import { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import { RcFile, UploadFile } from 'antd/lib/upload/interface';
import ItemPreview from './ItemPreview';

const Dragger = Upload.Dragger;

export default function AdvanceUpload(
  {
    maxCount = 1,
    acceptType = 'image',
    bucketType = 'public',
    valueMode = 'url',
    headers = { 'X-Requested-With': null as any },
    formatUrl = (key, props: AdvanceUploadProps) => Oss.getBucketAccessUrl(props.bucketType, key),
    withCredentials = true,
    params,
    ...props
  }: AdvanceUploadProps
) {
  const provider = useContext(AbstractProvider.Context);
  const configProvider = useContext(ConfigProvider.ConfigContext);
  const all = { maxCount, acceptType, bucketType, valueMode, headers, formatUrl, withCredentials, ...props };
  const [fileList, setFileList] = useState(getFileList(props.value, formatUrl, [], all));
  const [previewItem, setPreview] = useState<UploadFile>();

  useEffect(() => {
    setFileList(getFileList(props.value, formatUrl, fileList, all));
  }, [props.value]);

  // 控制上传校验
  const beforeUpload = useCallback((file: RcFile, files: RcFile[]) => {
    if (props.selectOnly) return false;
    if (props.beforeUpload) return props.beforeUpload(file, files);
    return true;
  }, [props.selectOnly, props.beforeUpload]);

  // 上传文件状态变化
  const onUploadChange = async(data: UploadChangeParam) => {
    setFileList([...data.fileList as any]);
    const items = data.fileList as FileList;
    const isAllComplete = !data.fileList.find((m) => m.status == 'uploading');
    if (isAllComplete) {
      // 添加上传处理切面
      await processUploadInteceptors(data.fileList, all);
      if (props.selectOnly) {
        const isSingle = maxCount === 1 && !props.multiple;
        const value = isSingle ? data.fileList[0] : data.fileList;
        props.onChange && props.onChange(value as Array<UploadFileValue>, items);
      } else {
        const value = normalizeValue(items, all);
        props.onChange && props.onChange(value,);
      }
    }
  };

  // 移除上传项
  const doRemove = async(f: UploadFileExtend) => {
    const onRemove = props.onRemove || provider.upload?.onRemove;
    await Promise.resolve(onRemove && onRemove(f));
    const afterItems = fileList.filter((e) => e !== f);
    setFileList(afterItems);
    // props.onChange && props.onChange(normalizeValue(afterItems, all), afterItems);
  };

  // 默认上传方法
  const defaultUploadToServer = async(context: RcCustomRequestOptions) => {
    const { bizId } = props;
    const file = (context.file as File);
    const onProgress = (percent: number) => {
      context.onProgress({ percent });
    };
    const type = getExtension(file.type, file.name);
    const overlaySameFile = props.sameKeep === true;
    const storeDir = props.storeDir;
    const options = {
      storeDir,
      overlaySameFile,
      fileType: type,
      bizId, bucketType,
      ...(params || {}),
    };
    const data = await Oss.uploadToAliOss(context.file as File, options, onProgress);
    if (data.success) {
      return props.returnAbsolute && formatUrl ? formatUrl(data.result, all) : data.result;
    }
    return Promise.reject(new Error(data.errorMsg));
  };

  // 自定义文件上传
  const customRequest = (context: RcCustomRequestOptions) => {
    const config = provider.upload || {};
    const uploadToServer = props.customRequest || config?.onUpload || defaultUploadToServer;
    const item = fileList.find((m) => m.uid == (context.file as any).uid);
    const error = checkUpload(context.file as File, acceptType, props.maxSize, config);
    if (error) {
      message.error(error?.message || '上传失败');
      return setTimeout(() => context.onError(error), 40);
    }
    Promise
      .resolve(uploadToServer(context, config))
      .then((key: string) => {
        if (item) {
          item.status = 'done';
          item.url = key;
        }
        context.onSuccess(JSON.stringify({ url: key }));
      })
      .catch((ex) => context.onError(ex));
  };

  // 渲染拖拽上传按钮
  const renderUploadButton = () => {
    const { listType, children } = props;
    if (children) {
      return children;
    }
    if (listType == 'text') {
      return (
        <Button type="primary">
          <PlusOutlined />
          {props.uploadText || '浏览...'}
        </Button>
      );
    }
    return (
      <div className="default-upload-btn">
        <PlusOutlined />
        <div className={configProvider?.getPrefixCls('upload-text')}>
          {props.uploadText || '上传'}
        </div>
      </div>
    );
  };

  // 渲染拖拽上传按钮
  const renderDraggerUpload = () => {
    return (
      <div className="dragger-button">
        <p className={configProvider?.getPrefixCls('upload-drag-icon')}>
          <InboxOutlined />
        </p>
        <div className={configProvider?.getPrefixCls('upload-text')}>
          {props.uploadText || '点击或者拖拽文件到此区域,进行文件上传'}
        </div>
      </div>
    );
  };

  // 渲染视图
  const { disabled, data, type, accept, ...rest } = props;
  const showUpload = !(fileList.length >= maxCount || disabled === true);
  const single = maxCount <= 1;
  const dragger = type === 'drag';
  const UploadFile = dragger ? Dragger : Upload;
  const uploadButton = dragger ? renderDraggerUpload() : renderUploadButton();
  const topClass = props.children ? 'has-children' : '';
  const media = provider?.upload?.media || AbstractProvider.defaultMediaDefinitions;
  const realAccept = accept || media[acceptType]?.accept || '';

  return (
    <div
      className={`clearfix advance-upload ${topClass} ${single ? 'single' : 'multiple'} ${props.className}`}
    >
      <div
        onDragStart={stopPropagation}
        onDragOver={stopPropagation}
      >
        <UploadFile
          data={data}
          className={`${acceptType} ${dragger ? 'dragger' : ''} ${showUpload ? 'show' : 'upload-hide'}`}
          disabled={disabled}
          listType="picture-card"
          {...rest}
          fileList={fileList}
          customRequest={customRequest}
          accept={realAccept}
          onRemove={doRemove}
          beforeUpload={beforeUpload}
          onPreview={setPreview}
          onChange={onUploadChange}
        >
          {showUpload ? uploadButton : null}
        </UploadFile>
      </div>
      <ItemPreview fileList={fileList} file={previewItem} onCancel={() => setPreview(null)} accept={accept} />
    </div>
  );
}

