declare module 'tk-crack/webmssdk-170' {
  interface WebMsSDK {
    init(options: any): any;
    getXBogus(url: string, body?: string): string;
  }

  const webmssdk: WebMsSDK;
  export default webmssdk;
}
