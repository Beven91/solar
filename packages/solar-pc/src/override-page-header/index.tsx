import { PageHeader, PageHeaderProps } from 'antd';
import { Route } from 'antd/lib/breadcrumb/Breadcrumb';
import React, { useContext, useEffect, useState } from 'react';

interface OverrideContextOptions {
  setOptions?: (options: OverridePageHeaderProps) => void
  getOptions?: () => OverridePageHeaderProps
}

interface OverridePageHeaderProps extends PageHeaderProps {
  appendRoutes?: Route[]
  visible?: boolean
}

export const OverrideContext = React.createContext<OverrideContextOptions>(null);

export default function OverridePageHeader(props: OverridePageHeaderProps) {
  const context = useContext(OverrideContext);

  useEffect(() => {
    context?.setOptions(props);
    return () => {
      context?.setOptions({});
    };
  });

  return null as React.ReactElement;
}

OverridePageHeader.PageHeader = (props: PageHeaderProps) => {
  const context = useContext(OverrideContext);
  const { appendRoutes, visible, ...options } = context?.getOptions() || {};

  let breadcrumb = props.breadcrumb || {} as any;
  if ('routes' in breadcrumb) {
    breadcrumb = {
      ...breadcrumb,
      routes: [
        ...(breadcrumb.routes || []),
        ...(appendRoutes || []),
      ],
    };
  }

  if (visible == false) {
    return null;
  }

  return (
    <PageHeader {...props} {...options} breadcrumb={breadcrumb} />
  );
};

OverridePageHeader.Container = (props: React.PropsWithChildren) => {
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
