/**
 * @module CodeHighlight
 * @description 基于prism的代码高亮组件
 */
import React, { useEffect, useState } from 'react';
import Prism from 'prismjs';
import { Spin } from 'antd';
import { Network } from 'solar-core';
import './index.scss';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';

export interface HLanguages {
  tsx: string
  typescript: string
  html: string
  xml: string
  css: string
  atom: string
  clike: string
  javascript: string
  js: string
  markup: string
  mathtml: string
  rss: string
  ssml: string
  svg: string
  text: string
  ts: string
}

export interface CodeHighlightProps {
  /**
   * 使用的语言
   */
  language: keyof HLanguages

  /**
   * 类名称
   */
  className?: string

  /**
   * 样式
   */
  style?: React.CSSProperties

  /**
   * 要高亮的代码
   */
  code?: string

  /**
   * 要展示的远程代码
   */
  url?: string
}

export default function CodeHighlight(props: CodeHighlightProps) {
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const highlight = (code: string) => Prism.highlight(code || '', Prism.languages[props.language], props.language);
  useEffect(
    () => {
      if (!props.url) return setHtml(highlight(props.code));
      // 如果是远程请求代码展示
      setLoading(true);
      (new Network()).get(props.url).text().then(
        (code) => {
          setLoading(false);
          setHtml(highlight(code));
        },
        () => setLoading(false)
      );
    },
    [props.code, props.language, props.url]
  );
  return (
    <Spin
      spinning={loading}
    >
      <pre
        style={props.style}
        className={`code-highlight language-${props.language} ${props.className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      >
      </pre>
    </Spin>
  );
}