export default class Response {
  body: any

  options: any

  constructor(body: any, options: any) {
    Object.assign(this, options);
    this.options = options;
    this.body = body;
    this.json = function() {
      const data = typeof body === 'string' ? JSON.parse(body) : body;
      return Promise.resolve(data);
    };
  }

  json() {
    const body = this.body;
    const data = typeof body === 'string' ? JSON.parse(body) : body;
    return Promise.resolve(data);
  }

  clone() {
    return new Response(this.body, this.options);
  };

  text() {
    const body = this.body;
    if (!body || typeof body === 'string') {
      return Promise.resolve(this.body);
    }
    return Promise.resolve(JSON.stringify(body));
  };
}
