declare module 'bf-main-configs' {

  export const HOST: string;

  export const CDN: string;

  export const API: string;
}

declare module '@loadable/component' {
  export default function loadable(task: () => Promise<any>): React.ComponentType | React.ComponentType<any> | undefined;
}