/**
 * @name Remaining 测试
 * @date 2018-04-25
 */
import React from 'react';
import ImageZoom from '../../src/image-zoom';

export default class RemainingApp extends React.Component {
  render() {
    return (
      <div style={styles.container}>
        <ImageZoom>
          <div>一下图片点击可放大哦</div>
          <img
            style={styles.img}
            src="https://static.solar.cn/T16lVbB4J41RCvBVdK.jpg?img=/rs,w_100"
            data-zoom="https://static.solar.cn/T16lVbB4J41RCvBVdK.jpg"
          />
          <img style={styles.img} src="https://static.solar.cn/T16lVbB4J41RCvBVdK.jpg?img=/rs,w_100" />
        </ImageZoom>
      </div>
    );
  }
}

const styles = {
  container: {
    textAlign: 'center' as any,
  },
  img: {
    width: 100,
    margin: '5px auto',
    display: 'block',
  },
  count: {
    color: 'green',
  },
};
