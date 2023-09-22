import { ItemType } from 'antd/lib/breadcrumb/Breadcrumb';
import React, { useContext, useEffect, useState } from 'react';
import PageHeader, { PageHeaderProps } from '../page-header';

interface OverrideContextOptions {
  setOptions?: (options: OverridePageHeaderProps) => void
  getOptions?: () => OverridePageHeaderProps
}

interface OverridePageHeaderProps extends PageHeaderProps {
  appendRoutes?: ItemType[]
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

// eslint-disable-next-line react/display-name
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

// eslint-disable-next-line react/display-name
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
