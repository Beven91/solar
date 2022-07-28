declare namespace chrome {
  export const env: 'content-script' | 'dev-tools' | 'popup' | 'options';

  namespace extension {
    export function sendMessage(options: any): any
  }
}
