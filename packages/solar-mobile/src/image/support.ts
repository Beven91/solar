

function getIsSupportWebp() {
  try {
    return (document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') == 0);
  } catch (ex) {
    return false;
  }
}

export const supportWebp = getIsSupportWebp();
