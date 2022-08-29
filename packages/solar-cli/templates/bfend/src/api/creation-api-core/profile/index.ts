import fs from 'fs';
import path from 'path';


export default class Profile<T> {
  public data: T;
  private file: string

  constructor(name: string, defaultValue: T) {
    const file = this.file = path.resolve('appdata/' + name + '.json');
    try {
      if (fs.existsSync(file)) {
        this.data = JSON.parse(fs.readFileSync(file).toString('utf-8'));
      } else {
        this.data = defaultValue;
      }
    } catch (ex) {

    }
  }

  save() {
    return new Promise((resolve) => {
      const file = this.file;
      fs.writeFileSync(file, JSON.stringify(this.data, null, 2));
      resolve({});
    });
  }
}
