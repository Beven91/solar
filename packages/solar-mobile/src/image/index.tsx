/**
 * 名称：云服务器图片组件
 * 日期:2018-01-08
 * 描述：自动根据图片环境来加载对应的图片资源
 */
import './index.scss';
import React from 'react';
import Oss from 'solar-core/src/oss';
import { supportWebp } from './support';

export interface ImageProps {
  // 裁剪的云服务器宽度与高度 例如 200,200
  size?: string,
  // 要显示的图片url 可以为相对路径或者绝对路径的图片url 也可以为云服务器的图片key
  src: string,
  // 默认图片类型
  defUrl?: string,
  // 样式类名
  className?: string
  style?: any
}

export interface ImageState {
  src: string
  visible: boolean,
  props?: object,
}

/*
  在云服务器地址下自动进行缩放时，如果获取当前dom元素的宽度为0时，
  默认使用的缩放最大宽度
*/
const MAX = 800;
const NORMAL = 375;

export default class Image extends React.PureComponent<ImageProps, ImageState> {
  // 初始化状态
  state = {
    src: '',
    visible: true,
    props: {},
  }

  domRef = React.createRef<HTMLImageElement>()

  componentDidMount() {
    // 在渲染后，由于需要计算图片款高所以放在didMount刷新图片
    this.refresh(this.props);
  }

  componentWillReceiveProps(nextProps: ImageProps) {
    // 更新url时，重新刷新云服务器数据
    if (nextProps.src !== this.props.src) {
      this.refresh(nextProps);
    }
  }

  /**
   * 获取自动裁剪值
   */
  get autoSize() {
    const dpr = window.devicePixelRatio || 1;
    const adapterWidth = window.screen.width || NORMAL;
    const element = this.domRef.current;
    if (element) {
      const width = Math.ceil(element.getBoundingClientRect().width) || element.offsetWidth || adapterWidth;
      const clientWidth = width > MAX ? MAX : width;
      // 获取最佳尺寸
      return (clientWidth * dpr).toFixed(0);
    }
    return (dpr * adapterWidth).toFixed(0);
  }

  /**
   * 获取图片地址
   */
  getAutoKey(ossKey: string, size?: string) {
    const o = Oss;
    const width = (size || this.autoSize);
    const key = o.resizeAliOss(ossKey, width as any);
    return supportWebp ? `${key}/format,webp` : key;
  }

  /**
   * 刷新渲染图片
   */
  refresh(props: any) {
    const { src, size, defUrl, ...others } = props;
    // 如果没有传递src则使用defUrl
    const displayUrl = src || defUrl || '';
    const finalUrl = this.getAutoKey(displayUrl, size);
    this.setState({
      props: others,
      visible: !!finalUrl,
      // 自动换算图片url 如果是云服务器文件 则使用size以及autoSize压缩图片方式请求文件 否则，使用原始url
      src: finalUrl,
    });
  }

  // 组件渲染
  render() {
    const { className } = this.props;
    const { src, props, visible } = this.state;
    return (
      <img
        {...props}
        referrerPolicy="no-referrer"
        className={`image-dynamic ${className || ''} ${visible ? '' : 'dynamic-hidden'}`}
        ref={this.domRef}
        src={src || ''}
      />
    );
  }
}
