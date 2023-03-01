import { useCallback, useState } from 'react';

export function useMiniLayout() {
  const isMini = () => document.documentElement.clientWidth < 540;
  const [collapsed, setCollapsed] = useState<boolean>(true);

  const requestMiniCollapsed = useCallback(() => {
    isMini() && setCollapsed(true);
  }, []);

  return {
    collapsed,
    requestMiniCollapsed,
    setCollapsed,
  };
}