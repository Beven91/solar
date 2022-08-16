import React from 'react';
import cssParse from 'css/lib/parse';
import { Rule, Stylesheet, Declaration } from 'css';
import { Spin } from 'antd';

const cache = {} as { [propName:string]:string };

export interface RemoteIconViewProps {
  // 字体图标url
  url:string
  // 选中的图标
  checkedIcon?:string
  // 图标加载完毕
  onLoad?:(family:string)=> void
  // 点击图标
  onClick?:(icon:string)=> void
  // 是否显示图标名
  showName?:boolean
}

export interface RemoteIconViewState {
  loading:boolean
  // 字体图标资源地址
  url:string
  // 图标样式文件对应的内容
  content?:string
  // 从样式文件解析出来的图标列表
  icons:Array<string>
  // 是否需要重新加载样式文件
  needReload?:boolean
}

export default class RemoteIconView extends React.Component<RemoteIconViewProps, RemoteIconViewState> {
  static getDerivedStateFromProps(props:RemoteIconViewProps, state:RemoteIconViewState) {
    if (props.url !== state.url) {
      return {
        url: props.url,
        needReload: true,
      };
    }
    return null;
  }

  // 当前字体样式名
  fontFamily:string;

  state:RemoteIconViewState = {
    url: '',
    loading: false,
    icons: [] as Array<string>,
  };

  /**
   * 记载字体文件
   * @returns
   */
  async fetchIcons() {
    const { url } = this.state;
    if (!this.state.needReload) return;
    if (!url) {
      return this.setState({ needReload: false, content: '' });
    }
    const { onLoad } = this.props;
    this.setState({ needReload: false, loading: true });
    const cacheContent = cache[url];
    const content = await (cacheContent ? cacheContent : fetch(url).then((res)=>res.text()));
    const icons = this.parseIconFont(content);
    this.setState({ needReload: false, icons: icons, content: content, loading: false });
    onLoad && onLoad(this.fontFamily);
  }

  /**
   * 解析当前url的所有图标
   * @param content
   * @returns
   */
  parseIconFont(content:string) {
    const parsed = cssParse(content) as Stylesheet;
    const rules = parsed.stylesheet.rules;
    const isFontFamily = (rule:Rule)=> rule.type=== 'rule' && rule.declarations?.find((d:Declaration)=> d.property === 'font-family');
    const fontFamily = rules.find(isFontFamily) as Rule;
    this.fontFamily = fontFamily?.selectors ? fontFamily.selectors[0]?.replace(/^\./, '') : '';
    return rules
      .filter((r:Rule)=> /:before/.test(r.selectors ? r.selectors[0] : ''))
      .map((r:Rule)=>{
        return r.selectors[0]?.replace(':before', '').replace(/^\./, '');
      });
  }

  componentDidMount() {
    this.fetchIcons();
  }

  componentDidUpdate() {
    this.fetchIcons();
  }

  handleClick = (icon:string)=>{
    const { onClick } = this.props;
    onClick && onClick(icon);
  };

  renderIcon(icon:string) {
    const { checkedIcon, showName } = this.props;
    return (
      <div
        key={icon}
        className={`remote-icon-view-icon ${ icon === checkedIcon ? 'checked' : '' } ${this.fontFamily} ${icon}`}
        onClick={()=>this.handleClick(icon)}
      >
        {
          showName ? <div className="icon-name">{icon}</div> : null
        }
      </div>
    );
  }

  render() {
    return (
      <Spin
        spinning={this.state.loading}
      >
        <div className="remote-icon-view">
          <style>{this.state.content}</style>
          {this.state.icons.map((icon)=>this.renderIcon(icon))}
        </div>
      </Spin>
    );
  }
}