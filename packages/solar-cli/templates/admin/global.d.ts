interface MainAppDebuggerModel {
  // 应用名
  name: string
  // 调试菜单
  menu: {
    name: string
    href: string
  }
}

declare module '@loadable/component' {
  export default function loadable(task: () => Promise<any>): React.ComponentType | React.ComponentType<any> | undefined;
}

interface ApiResponse<T = any> {
  success: boolean
  code: number
  message: string
  data: T
}