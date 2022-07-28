declare module 'whatwg-fetch' {

  export default fetch;
}

declare module 'qs/lib/stringify' {

  export default function (input: any): string;

}
