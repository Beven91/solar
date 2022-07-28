import stream from 'stream';

export default class RequestMemoryStream extends stream.Writable {
  private readBuffers: Buffer

  constructor(request: any, handler: (data: Buffer) => void) {
    super();
    this.readBuffers = Buffer.from([]);
    if (request.nativeRequest) {
      request.nativeRequest.pipe(this);
    } else {
      request.pipe(this);
    }
    this.on('finish', () => {
      handler(this.readBuffers);
      this.readBuffers = null;
    });
  }

  _write(chunk: any, encoding: any, cb: Function) {
    this.readBuffers = Buffer.concat([this.readBuffers, chunk]);
    cb();
  }
}
