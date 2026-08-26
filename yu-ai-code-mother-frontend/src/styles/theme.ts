import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context'

export const techTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1478ff',
    colorInfo: '#1478ff',
    colorSuccess: '#16a085',
    colorWarning: '#d99412',
    colorError: '#e5484d',
    colorText: '#14263d',
    colorTextSecondary: '#52647a',
    colorBgBase: '#ffffff',
    colorBgLayout: '#f3f7fc',
    colorBorder: 'rgba(80, 112, 146, 0.2)',
    borderRadius: 8,
    borderRadiusLG: 12,
    controlHeight: 34,
    fontFamily:
      "'Inter', 'HarmonyOS Sans SC', 'Microsoft YaHei UI', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    boxShadowSecondary: '0 14px 38px rgba(35, 65, 98, 0.11)',
  },
  components: {
    Button: {
      primaryShadow: '0 7px 18px rgba(20, 120, 255, 0.2)',
    },
    Layout: {
      bodyBg: 'transparent',
      headerBg: 'rgba(255, 255, 255, 0.88)',
      footerBg: 'rgba(247, 250, 255, 0.9)',
    },
    Menu: {
      itemBg: 'transparent',
      subMenuItemBg: 'transparent',
      horizontalItemSelectedColor: '#1478ff',
      horizontalItemHoverColor: '#1478ff',
    },
    Modal: {
      contentBg: 'rgba(255, 255, 255, 0.98)',
      headerBg: 'transparent',
    },
    Table: {
      headerBg: '#eef5fc',
      headerColor: '#14263d',
      rowHoverBg: 'rgba(20, 120, 255, 0.045)',
    },
  },
}
