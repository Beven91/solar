
import audio from '../elements/audio-mock';
import script from '../elements/script-mock';

const createElement = window.document.createElement.bind(window.document);

window.document.createElement = function(name: string, params: any, ...other: any) {
  switch (name.toLowerCase()) {
    case 'audio':
      return audio();
    case 'script':
      return script(createElement);
    default:
      return createElement.apply(this, [name, params, ...other]);
  }
};
