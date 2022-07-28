// /**
//  * @module Localization
//  * @description 国际化提供组件
//  */
// import React from 'react';
// import i18n from 'i18next';
// import Network from '../network';
// import { initReactI18next } from 'react-i18next';
// import { ResourceStatus } from './types';

//  interface LocaleContext {
//    language: string
//  }

//  interface LocalizationProps {
//   onLoad:(language:any)=>void
//  }

//  interface LocalizationState {
//    language: string
//    status?:ResourceStatus
//  }

// const { Consumer, Provider } = React.createContext<LocaleContext>({ language: '' });

// export default class Localization extends React.Component<LocalizationProps, LocalizationState> {
//    static Consumer = Consumer

//    state:LocalizationState = {
//      status: 'loading',
//      language: '',
//    }

//    constructor(props: LocalizationProps) {
//      super(props);
//      this.fetchAppResources();
//    }

//    /**
//    * 加载远程配置资源
//    */
//    async fetchAppResources() {
//      try {
//        const { onLoad, resourceUrl } = this.props;
//        const promise = typeof resourceUrl === 'string' ? (new Network()).get(resourceUrl).json() : resourceUrl;
//        const res = await promise;
//        const value = res || { } as T;
//        onLoad && onLoad(value);
//        this.setState({
//          status: 'done',
//          value: value,
//        });
//      } catch (ex) {
//        console.error(ex);
//        this.setState({
//          status: 'error',
//        });
//      }
//    }

//    initialize(locales: any) {
//      const language = 'zh';
//      i18n
//        .use(initReactI18next)
//        .init({
//          lng: language,
//          resources: locales || {},
//          fallbackLng: 'zh',
//          debug: true,
//          ns: ['translations'],
//          defaultNS: 'translations',
//          keySeparator: false, // we use content as keys
//          interpolation: {
//            escapeValue: false,
//          },
//        }, () => {
//          this.setState({ language });
//        });
//    }

//    render() {
//      const context = { language: this.state.language };
//      return (
//        <Provider
//          value={context}
//        >
//          {this.props.children}
//        </Provider>
//      );
//    }
// }
