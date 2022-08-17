
export default function merge(target: Record<string, any>, from: Record<string, any>) {
  Object.keys(from || {}).forEach((key) => {
    const value = target[key];
    if (typeof value == 'object' && value) {
      merge(value, from[key]);
    } else {
      target[key] = from[key];
    }
  });
  return { ...target };
}