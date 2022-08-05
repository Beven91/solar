import { PageHeader, PageHeaderProps } from 'antd';
import React, { useContext, useEffect, useState } from 'react';

interface OverrideContextOptions {
  setOptions?: (options: PageHeaderProps) => void
  getOptions?: () => PageHeaderProps
}

export const OverrideContext = React.createContext<OverrideContextOptions>(null);

export default function OverridePageHeader(props: PageHeaderProps) {
  const context = useContext(OverrideContext);

  useEffect(() => {
    context?.setOptions(props);
    return () => {
      context?.setOptions({});
    };
  });

  return null as React.ReactElement;
}

OverridePageHeader.PageHeader = function PageHeaderWrapper(props: PageHeaderProps) {
  const context = useContext(OverrideContext);
  const options = context?.getOptions() || {};

  return (
    <PageHeader {...props} {...options} />
  );
};

OverridePageHeader.Container = function Container(props: React.PropsWithChildren) {
  const [options, setOptions] = useState<PageHeaderProps>();
  const context: OverrideContextOptions = {
    getOptions: () => {
      return options;
    },
    setOptions: setOptions,
  };

  return (
    <OverrideContext.Provider value={context} >
      {props.children}
    </OverrideContext.Provider>
  );
};
