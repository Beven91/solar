/**
 * @name Image 测试
 * @date 2018-04-25
 */
import './index.scss';
import React from 'react';
import Image from '../../src/image';

export default class ImageApp extends React.Component<any, any> {
  state = { } as any

  componentWillMount() {
    setTimeout(() => {
      this.setState({
        img: 'CCC',
      });
    }, 300);
  }

  componentDidUpdate() {
    setTimeout(() => {
      this.setState({
        imgUrl: 'BBB',
      });
    }, 200);
  }

  render() {
    const { img, imgUrl } = this.state;
    return (
      <div>
        <Image src="AAA" className="hello" />
        <Image src={img} style={styles.one} />
        <Image src={imgUrl} />
        <div>
          <Image className="fit-width" src="" />
        </div>
        <Image src="http://www.solar.com/image/a.jpg" />
      </div>
    );
  }
}

const styles = {
  one: {
    width: 120,
  },
};
