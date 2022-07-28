declare module '$configs$' {

  export const HOST: string;

  export const CDN: string;

  export const MOCK: string;

  export const API: string;

  export const REST: string;

  export const SSO: string;

  export const SYSTEM_BASE: string;

}

declare module '$projectName$-configs' {
  export const HOST: string;

  export const CDN: string;

  export const MOCK: string;

  export const API: string;

  export const REST: string;

  export const SSO: string;

  export const SYSTEM_BASE: string;

  export const DEBUGGER_SYSTEM_BASE: string;
}

declare module '$projectName$-provider' {

  export const store: {
    Provider: any
    store: any
    connect: (...params: Array<any>) => any
  };

  export const Profile: any;
}

declare module '$projectName$-services' {

}

declare module '$projectName$-services'

declare module '$uiModules$'

declare module '$storeModule$'

declare module '$serviceModule$'

declare module '$projectName$-ui' {

  export class AdminPage<T, S = {}> extends React.Component<T, S> {

  }
}

interface Process {
  env: Record<string, string>
}

declare module 'xlsx/dist/xlsx.full.min.js' {
  const xlsx: any;
  export default xlsx;
}

declare module 'xlsx' {
  const xlsx: any;
  export default xlsx;
}

declare module 'css/lib/parse' {
  export default function(content:string):import('css').Stylesheet;
}