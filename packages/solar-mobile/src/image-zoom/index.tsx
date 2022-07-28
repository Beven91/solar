/**
 * @name ImageZoom 图片放大容器组件
 * @date 2018-05-02
 * @description
 *       支持容器下，指定类型图片标签在点击
 */
import './index.scss';
import '../polyfill/requestAnimation';
import PinchZoom from 'pinch-zoom-js';
import React from 'react';

export default class ImageZoom extends React.Component {
  // 点击事件，在点击图片时,进行放大
  onPinchZoom = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const target = e.target as HTMLElement;
    const src = target.getAttribute('src');
    const bigSrc = target.getAttribute('data-zoom');
    const url = bigSrc || src;
    if (url) {
      const html = `
        <div class="image-zoom-container show">
          <div>
            <img src="${url}" class="image"/>
          </div>
        </div>
      `;
      const div = document.createElement('div');
      div.innerHTML = html;
      div.addEventListener('click', function() {
        document.body.removeChild(div);
      });
      document.body.appendChild(div);
      new PinchZoom(div.children[0].children[0] as HTMLElement);
    }
  }

  // 渲染组件
  render() {
    return (
      <div onClick={this.onPinchZoom} {...this.props}>
        {this.props.children}
      </div>
    );
  }
}
