/**
 * @name AsyncView 测试
 * @date 2018-04-03
 */
import './index.scss';
import React from 'react';
import { Button, Modal, List, Carousel, Checkbox, Switch, InputItem, DatePicker } from 'antd-mobile';
import ScrollView from '../../src/scroll-view';
import image1 from './images/1.jpg';
import image2 from './images/2.jpg';
import image3 from './images/3.jpg';

const pictures = [image1, image2, image3];

const data = [
  { value: 0, label: 'Ph.D.' },
  { value: 1, label: 'Bachelor' },
  { value: 2, label: 'College diploma' },
];

const CheckboxItem = Checkbox.CheckboxItem;

export default class ScrollViewApp extends React.Component {
  middleRef = React.createRef<HTMLDivElement>()

  scrollRef = React.createRef<ScrollView>()

  state = {
    data: ['0', '1', '2'],
    visible: false,
    checked: false,
  }

  componentDidMount() {
    setTimeout(() => {
      this.middleRef.current.style.height = '800px';
    }, 1000);
  }

  handleClick = () => {
    this.setState({
      visible: true,
    });
  }

  handleScroll = (e: any) => {
    console.log('scroll', e.currentTarget.scrollTop);
  }

  handleReachEnd = () => {
    console.log('reach end......');
  }

  onClose = () => {
    this.setState({ visible: false });
  }

  scrollTo = () => {
    this.scrollRef.current.scrollTo(null, 200);
  }

  render() {
    return (
      <ScrollView
        nested
        observe
        ref={this.scrollRef}
        onScroll={this.handleScroll}
        onEndReached={this.handleReachEnd}
      >
        <div className="content">
          <p> 三余无梦生 <input type="checkbox" /> </p>
          <img src={image1} />
          <h4>表单</h4>
          <List renderHeader={() => 'CheckboxItem demo'}>
            {data.map(i => (
              <CheckboxItem key={i.value} >
                {i.label}
              </CheckboxItem>
            ))}
            <CheckboxItem key="disabled" data-seed="logId" disabled defaultChecked multipleLine>
              Undergraduate<List.Item.Brief>Auxiliary text</List.Item.Brief>
            </CheckboxItem>
            <DatePicker >
              <List.Item arrow="horizontal">Datetime</List.Item>
            </DatePicker>
            <InputItem
              placeholder="start from left"
              clear
              moneyKeyboardAlign="left"
            >光标在左
            </InputItem>
            <InputItem
              placeholder="start from right"
              clear
            >光标在右
            </InputItem>
            <InputItem
              placeholder="money format"
              onVirtualKeyboardConfirm={v => console.log('onVirtualKeyboardConfirm:', v)}
              clear
            >数字键盘
            </InputItem>
            <List.Item >
              <p> 双刀 <input type="radio" /> </p>
            </List.Item>
            <List.Item
              extra={
                <Switch
                  checked={this.state.checked}
                  onChange={
                    () => this.setState({ checked: !this.state.checked })
                  }
                />
              }
            >
              开关
            </List.Item>
            <List.Item
              extra={<input style={{ width: '100%' }} type="text" />}
            >
              输入
            </List.Item>
            <List.Item
              extra={
                <textarea onChange={(a) => a} style={{ height: 80, width: '100%' }} value="华华人间世，浩浩海江衣。知年指荏苒，繁花漫荒初。 洒洒落人间，微微同太古。" />
              }
            >
              备注
            </List.Item>
          </List>
          <Button type="primary" onClick={this.handleClick}>打开窗口</Button>
          <div>&nbsp;</div>
          <Button type="primary" onClick={this.scrollTo}>跳转到200</Button>
        </div>
        <div>
          <h4>轮播组件</h4>
          <Carousel
            autoplay={false}
            infinite
            beforeChange={(from, to) => console.log(`slide from ${from} to ${to}`)}
            afterChange={index => console.log('slide to', index)}
          >
            {this.state.data.map(val => (
              <a
                key={val}
                style={{ display: 'inline-block', width: '100%', height: 238 }}
              >
                <img
                  src={pictures[Number(val)]}
                  alt=""
                  style={{ width: '100%', height: '100%', verticalAlign: 'top' }}
                  onLoad={() => {
                    // fire window resize event to change height
                    window.dispatchEvent(new Event('resize'));
                    this.setState({ imgHeight: 'auto' });
                  }}
                />
              </a>
            ))}
          </Carousel>
        </div>
        <div>
          <h4>嵌套滚动</h4>
          <ScrollView style={{ height: 400 }}>
            <p>素还真</p>
            <img src={image2} />
            <p>天踦爵</p>
            <img src={image3} />
          </ScrollView>
        </div>
        <div>
          <h4>水平滚动</h4>
          <ScrollView nested={false} direction="horizon" className="horizon">
            <div className="container">
              <div className="inner"></div>
              <div className="inner2"></div>
            </div>
          </ScrollView>
        </div>
        <div ref={this.middleRef} className="content yellow">

        </div>
        <div className="content blue"></div>
          ~到底啦....
        <Modal
          visible={this.state.visible}
          transparent
          className="content"
          style={{ width: 350 }}
          maskClosable={false}
          title="弹窗"
          footer={[{ text: 'Ok', onPress: () => {
            this.onClose();
          } }]}
        >
          <div style={{ height: 200, overflow: 'scroll' }}>
            <p> 三余无梦生 <input type="checkbox" /> </p>
            <img src={image1} />
            <p> 双刀 <input type="radio" /> </p>
            <div>输入吧：<input type="text" /></div>
            <div>备注吧：<textarea /></div>
            <p>素还真</p>
            <img src={image2} />
          </div>
        </Modal>
      </ScrollView>
    );
  }
}