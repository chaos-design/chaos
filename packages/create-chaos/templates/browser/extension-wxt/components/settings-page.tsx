import {
  AppWindowIcon,
  CheckCircle2Icon,
  CircleDotIcon,
  GitForkIcon,
  HardDriveIcon,
  InfoIcon,
  KeyboardIcon,
  LockKeyholeIcon,
  type LucideIcon,
  MonitorIcon,
  MoonIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  PanelRightIcon,
  RotateCcwIcon,
  SearchIcon,
  Settings2Icon,
  SettingsIcon,
  ShieldCheckIcon,
  SunIcon,
} from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldTitle,
} from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { appConfig } from '@/config/app-config';
import { useExtensionSettings } from '@/hooks/use-extension-settings';
import { useExtensionTheme } from '@/hooks/use-extension-theme';
import {
  defaultExtensionSettings,
  type FloatingBallPosition,
  type ThemeMode,
  type ToolbarMode,
} from '@/lib/extension-settings';
import { cn } from '@/lib/utils';

type SettingsTab =
  | 'about'
  | 'floating-ball'
  | 'general'
  | 'privacy'
  | 'popup'
  | 'shortcuts';

const systemThemeOption: {
  icon: LucideIcon;
  label: string;
  value: ThemeMode;
} = {
  icon: MonitorIcon,
  label: '系统',
  value: 'system',
};

const themeOptions = [
  systemThemeOption,
  {
    icon: SunIcon,
    label: '亮色',
    value: 'light',
  },
  {
    icon: MoonIcon,
    label: '暗色',
    value: 'dark',
  },
] satisfies Array<{
  icon: LucideIcon;
  label: string;
  value: ThemeMode;
}>;

const settingsNavigation: Array<{
  icon: LucideIcon;
  label: string;
  value: SettingsTab;
}> = [
  {
    icon: Settings2Icon,
    label: '常规',
    value: 'general',
  },
  {
    icon: AppWindowIcon,
    label: 'Popup',
    value: 'popup',
  },
  {
    icon: CircleDotIcon,
    label: '悬浮球',
    value: 'floating-ball',
  },
  {
    icon: ShieldCheckIcon,
    label: '隐私与安全',
    value: 'privacy',
  },
  {
    icon: KeyboardIcon,
    label: '快捷键',
    value: 'shortcuts',
  },
  {
    icon: InfoIcon,
    label: '关于',
    value: 'about',
  },
];

const settingsSearchItems: Array<{
  description: string;
  icon: LucideIcon;
  keywords: string[];
  label: string;
  value: SettingsTab;
}> = [
  {
    description: '管理扩展外观与工具栏入口',
    icon: Settings2Icon,
    keywords: ['general', '常规', '外观', '主题', '工具栏'],
    label: '常规设置',
    value: 'general',
  },
  {
    description: '暗色、亮色或跟随系统',
    icon: MoonIcon,
    keywords: ['theme', 'dark', 'light', 'system', '主题', '外观'],
    label: '显示模式',
    value: 'general',
  },
  {
    description: '配置 Popup 与 Side panel',
    icon: PanelRightIcon,
    keywords: ['toolbar', 'popup', 'sidepanel', '工具栏', '入口'],
    label: '启用入口',
    value: 'general',
  },
  {
    description: '调整 Popup 的宽度和高度',
    icon: AppWindowIcon,
    keywords: ['popup', 'width', 'height', '窗口', '尺寸', '宽度', '高度'],
    label: 'Popup 窗口尺寸',
    value: 'popup',
  },
  {
    description: '配置显示状态、停靠位置和尺寸',
    icon: CircleDotIcon,
    keywords: ['floating', '悬浮球', '页面', '停靠', '按钮', '尺寸'],
    label: '页面悬浮球',
    value: 'floating-ball',
  },
  {
    description: '查看本地存储与数据同步状态',
    icon: ShieldCheckIcon,
    keywords: ['privacy', 'storage', '隐私', '安全', '本地', '数据'],
    label: '隐私与安全',
    value: 'privacy',
  },
  {
    description: '查看设置页与浏览器快捷键',
    icon: KeyboardIcon,
    keywords: ['keyboard', 'shortcut', '快捷键', '搜索'],
    label: '键盘快捷键',
    value: 'shortcuts',
  },
  {
    description: '查看扩展名称、版本与技术信息',
    icon: InfoIcon,
    keywords: ['about', 'version', '关于', '版本', '信息'],
    label: '关于扩展',
    value: 'about',
  },
];

interface SettingsCardProps {
  action?: ReactNode;
  children: ReactNode;
  description: string;
  icon: LucideIcon;
  title: string;
}

function SettingsCard({
  action,
  children,
  description,
  icon: Icon,
  title,
}: SettingsCardProps) {
  return (
    <Card className="settings-card" size="sm">
      <CardHeader>
        <span className="settings-card-icon">
          <Icon aria-hidden="true" className="settings-card-glyph" />
        </span>
        <div className="settings-card-copy">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <Separator />
      <CardContent>{children}</CardContent>
    </Card>
  );
}

interface SliderFieldProps {
  description: string;
  label: string;
  max: number;
  min: number;
  onValueChange: (value: number) => void;
  step: number;
  unit: string;
  value: number;
}

function SliderField({
  description,
  label,
  max,
  min,
  onValueChange,
  step,
  unit,
  value,
}: SliderFieldProps) {
  return (
    <Field
      className="settings-row settings-slider-field"
      orientation="responsive"
    >
      <FieldContent>
        <FieldTitle>{label}</FieldTitle>
        <FieldDescription>{description}</FieldDescription>
      </FieldContent>
      <div className="settings-slider-control">
        <div className="settings-field-heading">
          <span>当前值</span>
          <Badge variant="outline">
            {value}
            {unit}
          </Badge>
        </div>
        <Slider
          aria-label={label}
          max={max}
          min={min}
          step={step}
          value={value}
          onValueChange={(nextValue) => {
            const normalizedValue = Array.isArray(nextValue)
              ? nextValue[0]
              : nextValue;
            if (typeof normalizedValue === 'number') {
              onValueChange(normalizedValue);
            }
          }}
        />
        <div className="settings-range-labels" aria-hidden="true">
          <span>
            {min}
            {unit}
          </span>
          <span>
            {max}
            {unit}
          </span>
        </div>
      </div>
    </Field>
  );
}

export function SettingsPage() {
  const { isReady, settings, updateSettings } = useExtensionSettings();
  const resolvedTheme = useExtensionTheme(settings.theme, true);
  const extensionVersion = browser.runtime.getManifest?.().version ?? '0.0.0';
  const popupConfig = appConfig.surfaces.popup;
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const activeTheme =
    themeOptions.find((option) => option.value === settings.theme) ??
    systemThemeOption;
  const ActiveThemeIcon = activeTheme.icon;

  useEffect(() => {
    const handleSearchShortcut = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLocaleLowerCase() === 'k'
      ) {
        event.preventDefault();
        setSearchQuery('');
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleSearchShortcut);
    return () => document.removeEventListener('keydown', handleSearchShortcut);
  }, []);

  const openSearch = () => {
    setSearchQuery('');
    setIsSearchOpen(true);
  };

  const openSearchResult = (value: SettingsTab) => {
    setActiveTab(value);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const updateSearchOpen = (open: boolean) => {
    setIsSearchOpen(open);
    if (!open) {
      setSearchQuery('');
    }
  };

  return (
    <TooltipProvider>
      <Tabs
        className={cn('settings-layout', resolvedTheme === 'dark' && 'dark')}
        data-sidebar-open={isSidebarOpen}
        orientation="vertical"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as SettingsTab)}
      >
        <aside
          aria-label="设置菜单"
          className="settings-sidebar"
          id="settings-sidebar"
        >
          <div className="settings-brand">
            <span className="settings-brand-mark">
              <SettingsIcon
                aria-hidden="true"
                className="settings-brand-glyph"
              />
            </span>
            <span>
              <strong>{appConfig.shortName}</strong>
              <small>Build the browser you need.</small>
            </span>
          </div>

          <p className="settings-nav-label">设置</p>
          <TabsList aria-label="设置导航">
            {settingsNavigation.map((item) => {
              const Icon = item.icon;

              return (
                <Tooltip disabled={isSidebarOpen} key={item.value}>
                  <TooltipTrigger
                    render={
                      <TabsTrigger aria-label={item.label} value={item.value} />
                    }
                  >
                    <Icon data-icon="inline-start" />
                    <span className="settings-nav-copy">{item.label}</span>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TabsList>

          <div className="settings-sidebar-footer">
            <LockKeyholeIcon
              aria-hidden="true"
              className="settings-footer-glyph"
            />
            <span>
              <strong>本地配置</strong>
              <small>数据不会离开此浏览器</small>
            </span>
          </div>
        </aside>

        <div className="settings-main">
          <header className="settings-topbar">
            <div className="settings-topbar-context">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      aria-controls="settings-sidebar"
                      aria-expanded={isSidebarOpen}
                      aria-label={isSidebarOpen ? '收起菜单' : '展开菜单'}
                      className="settings-sidebar-trigger"
                      size="icon"
                      variant="outline"
                      onClick={() => setIsSidebarOpen((current) => !current)}
                    />
                  }
                >
                  {isSidebarOpen ? (
                    <PanelLeftCloseIcon />
                  ) : (
                    <PanelLeftOpenIcon />
                  )}
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {isSidebarOpen ? '收起菜单' : '展开菜单'}
                </TooltipContent>
              </Tooltip>
              <Button
                aria-keyshortcuts="Meta+K Control+K"
                className="settings-search-trigger"
                variant="outline"
                onClick={openSearch}
              >
                <SearchIcon data-icon="inline-start" />
                <span className="settings-search-trigger-copy">搜索设置</span>
                <kbd className="settings-search-shortcut">⌘ + K</kbd>
              </Button>
            </div>
            <div className="settings-topbar-actions">
              <Badge className="settings-save-state" variant="outline">
                <span className="status-pulse" aria-hidden="true" />
                已保存到本地
              </Badge>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      aria-label="恢复默认设置"
                      disabled={!isReady}
                      size="icon"
                      variant="outline"
                      onClick={() => updateSettings(defaultExtensionSettings)}
                    />
                  }
                >
                  <RotateCcwIcon />
                </TooltipTrigger>
                <TooltipContent>恢复默认设置</TooltipContent>
              </Tooltip>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      aria-label={`显示模式：${activeTheme.label}`}
                      className="settings-theme-trigger"
                      disabled={!isReady}
                      size="icon"
                      title="显示模式"
                      variant="ghost"
                    />
                  }
                >
                  <ActiveThemeIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  aria-label="显示模式"
                  align="end"
                  className="settings-theme-menu"
                  sideOffset={8}
                >
                  <DropdownMenuGroup>
                    <DropdownMenuRadioGroup
                      value={settings.theme}
                      onValueChange={(theme) => {
                        if (
                          theme === 'dark' ||
                          theme === 'light' ||
                          theme === 'system'
                        ) {
                          updateSettings({ theme });
                        }
                      }}
                    >
                      {themeOptions.map((option) => {
                        const Icon = option.icon;

                        return (
                          <DropdownMenuRadioItem
                            closeOnClick
                            key={option.value}
                            value={option.value}
                          >
                            <Icon />
                            {option.label}
                          </DropdownMenuRadioItem>
                        );
                      })}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <div className="settings-content">
            <TabsContent value="general">
              <div className="settings-page-heading">
                <span>General</span>
                <h1>常规设置</h1>
                <p>管理扩展外观与浏览器工具栏的默认启动入口。</p>
              </div>

              <SettingsCard
                action={
                  <Badge variant="outline">
                    <CheckCircle2Icon data-icon="inline-start" />
                    浏览器本地
                  </Badge>
                }
                description="选择从浏览器工具栏打开 Popup 或侧边栏。"
                icon={Settings2Icon}
                title="工具栏入口"
              >
                <FieldGroup className="settings-row-group">
                  <Field className="settings-row" orientation="responsive">
                    <FieldContent>
                      <FieldTitle id="toolbar-mode-label">启用入口</FieldTitle>
                      <FieldDescription>
                        可同时启用；同时启用时工具栏会优先打开 Popup。
                      </FieldDescription>
                    </FieldContent>
                    <ToggleGroup
                      aria-labelledby="toolbar-mode-label"
                      className="settings-choice-group"
                      multiple
                      spacing={0}
                      value={settings.toolbarModes}
                      variant="outline"
                      onValueChange={(value) => {
                        const toolbarModes = value.filter(
                          (mode): mode is ToolbarMode =>
                            mode === 'popup' || mode === 'sidepanel',
                        );
                        if (toolbarModes.length > 0) {
                          updateSettings({ toolbarModes });
                        }
                      }}
                    >
                      <ToggleGroupItem value="popup">
                        <AppWindowIcon data-icon="inline-start" />
                        Popup
                      </ToggleGroupItem>
                      <ToggleGroupItem value="sidepanel">
                        <PanelRightIcon data-icon="inline-start" />
                        Side panel
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </Field>
                </FieldGroup>
              </SettingsCard>
            </TabsContent>

            <TabsContent value="popup">
              <div className="settings-page-heading">
                <span>Popup</span>
                <h1>窗口尺寸</h1>
                <p>调整浏览器工具栏弹出窗口的可视区域。</p>
              </div>

              <SettingsCard
                action={<Badge variant="outline">下次打开时生效</Badge>}
                description="边界由脚手架配置约束，避免内容超出浏览器允许范围。"
                icon={AppWindowIcon}
                title="Popup 边界"
              >
                <FieldGroup className="settings-row-group">
                  <SliderField
                    description="控制弹出窗口的横向内容空间。"
                    label="窗口宽度"
                    max={popupConfig.maxWidth}
                    min={popupConfig.minWidth}
                    step={10}
                    unit="px"
                    value={settings.popupWidth}
                    onValueChange={(popupWidth) =>
                      updateSettings({ popupWidth })
                    }
                  />
                  <Separator />
                  <SliderField
                    description="控制弹出窗口打开后的可见高度。"
                    label="窗口高度"
                    max={popupConfig.maxHeight}
                    min={popupConfig.minHeight}
                    step={10}
                    unit="px"
                    value={settings.popupHeight}
                    onValueChange={(popupHeight) =>
                      updateSettings({ popupHeight })
                    }
                  />
                </FieldGroup>
              </SettingsCard>
            </TabsContent>

            <TabsContent value="floating-ball">
              <div className="settings-page-heading">
                <span>Floating access</span>
                <h1>页面悬浮球</h1>
                <p>控制匹配页面中的快捷入口、停靠位置与触控尺寸。</p>
              </div>

              <SettingsCard
                action={
                  <Badge
                    className={cn(
                      settings.floatingBallEnabled && 'settings-enabled-badge',
                    )}
                    variant={
                      settings.floatingBallEnabled ? 'default' : 'secondary'
                    }
                  >
                    {settings.floatingBallEnabled ? '已启用' : '已停用'}
                  </Badge>
                }
                description="设置会实时同步到已打开且符合匹配规则的网页。"
                icon={CircleDotIcon}
                title="悬浮入口"
              >
                <FieldGroup className="settings-row-group">
                  <Field className="settings-row" orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>显示悬浮球</FieldTitle>
                      <FieldDescription>
                        启用页面上的可拖拽快捷入口。
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      aria-label="显示悬浮球"
                      checked={settings.floatingBallEnabled}
                      onCheckedChange={(floatingBallEnabled) =>
                        updateSettings({ floatingBallEnabled })
                      }
                    />
                  </Field>
                  <Separator />
                  <Field
                    className="settings-row"
                    data-disabled={!settings.floatingBallEnabled}
                    orientation="responsive"
                  >
                    <FieldContent>
                      <FieldTitle id="dock-position-label">停靠边缘</FieldTitle>
                      <FieldDescription>
                        拖动后自动吸附，并记住当前垂直位置。
                      </FieldDescription>
                    </FieldContent>
                    <ToggleGroup
                      aria-labelledby="dock-position-label"
                      className="settings-choice-group"
                      disabled={!settings.floatingBallEnabled}
                      spacing={0}
                      value={[settings.floatingBallPosition]}
                      variant="outline"
                      onValueChange={(value) => {
                        const floatingBallPosition = value[0] as
                          | FloatingBallPosition
                          | undefined;
                        if (floatingBallPosition) {
                          updateSettings({
                            floatingBallPosition,
                            floatingBallVerticalRatio:
                              defaultExtensionSettings.floatingBallVerticalRatio,
                          });
                        }
                      }}
                    >
                      <ToggleGroupItem value="bottom-left">
                        左侧
                      </ToggleGroupItem>
                      <ToggleGroupItem value="bottom-right">
                        右侧
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </Field>
                  <Separator />
                  <SliderField
                    description="保持足够的点击区域，同时减少页面遮挡。"
                    label="按钮尺寸"
                    max={64}
                    min={44}
                    step={4}
                    unit="px"
                    value={settings.floatingBallSize}
                    onValueChange={(floatingBallSize) =>
                      updateSettings({ floatingBallSize })
                    }
                  />
                </FieldGroup>
              </SettingsCard>
            </TabsContent>

            <TabsContent value="privacy">
              <div className="settings-page-heading">
                <span>Privacy & security</span>
                <h1>隐私与安全</h1>
                <p>查看扩展的数据存储范围，并管理保存在当前浏览器中的偏好。</p>
              </div>

              <SettingsCard
                action={
                  <Badge variant="outline">
                    <HardDriveIcon data-icon="inline-start" />
                    仅此设备
                  </Badge>
                }
                description="扩展不连接账号系统，也不会把设置上传到远程数据库。"
                icon={ShieldCheckIcon}
                title="本地数据"
              >
                <FieldGroup className="settings-row-group">
                  <Field className="settings-row" orientation="responsive">
                    <FieldContent>
                      <FieldTitle>设置存储</FieldTitle>
                      <FieldDescription>
                        主题、窗口尺寸与入口偏好保存在 browser.storage.local。
                      </FieldDescription>
                    </FieldContent>
                    <Badge variant="outline">浏览器本地</Badge>
                  </Field>
                  <Separator />
                  <Field className="settings-row" orientation="responsive">
                    <FieldContent>
                      <FieldTitle>云端同步</FieldTitle>
                      <FieldDescription>
                        当前模板未接入账号、分析服务或远程数据库。
                      </FieldDescription>
                    </FieldContent>
                    <Badge variant="secondary">未启用</Badge>
                  </Field>
                  <Separator />
                  <Field className="settings-row" orientation="responsive">
                    <FieldContent>
                      <FieldTitle>恢复默认设置</FieldTitle>
                      <FieldDescription>
                        清除当前偏好，并恢复脚手架提供的初始值。
                      </FieldDescription>
                    </FieldContent>
                    <Button
                      disabled={!isReady}
                      size="sm"
                      variant="outline"
                      onClick={() => updateSettings(defaultExtensionSettings)}
                    >
                      <RotateCcwIcon data-icon="inline-start" />
                      恢复默认
                    </Button>
                  </Field>
                </FieldGroup>
              </SettingsCard>
            </TabsContent>

            <TabsContent value="shortcuts">
              <div className="settings-page-heading">
                <span>Keyboard</span>
                <h1>快捷键</h1>
                <p>快速打开设置搜索，并了解由浏览器统一管理的扩展快捷键。</p>
              </div>

              <SettingsCard
                action={<Badge variant="outline">键盘可用</Badge>}
                description="设置页快捷键立即生效，浏览器级快捷键由扩展管理页配置。"
                icon={KeyboardIcon}
                title="键盘操作"
              >
                <FieldGroup className="settings-row-group">
                  <Field className="settings-row" orientation="responsive">
                    <FieldContent>
                      <FieldTitle>搜索设置</FieldTitle>
                      <FieldDescription>
                        在设置页任意位置打开搜索面板。
                      </FieldDescription>
                    </FieldContent>
                    <kbd className="settings-shortcut-key">⌘ K</kbd>
                  </Field>
                  <Separator />
                  <Field className="settings-row" orientation="responsive">
                    <FieldContent>
                      <FieldTitle>关闭搜索</FieldTitle>
                      <FieldDescription>
                        关闭搜索面板并返回当前设置页面。
                      </FieldDescription>
                    </FieldContent>
                    <kbd className="settings-shortcut-key">Esc</kbd>
                  </Field>
                  <Separator />
                  <Field className="settings-row" orientation="responsive">
                    <FieldContent>
                      <FieldTitle>扩展快捷键</FieldTitle>
                      <FieldDescription>
                        打开扩展、Popup 等全局操作由浏览器统一分配。
                      </FieldDescription>
                    </FieldContent>
                    <Badge variant="secondary">浏览器管理</Badge>
                  </Field>
                </FieldGroup>
              </SettingsCard>
            </TabsContent>

            <TabsContent value="about">
              <div className="settings-page-heading">
                <span>About</span>
                <h1>关于</h1>
                <p>查看当前扩展模板的基础信息与运行技术栈。</p>
              </div>

              <SettingsCard
                action={<Badge variant="outline">WXT</Badge>}
                description={appConfig.description}
                icon={InfoIcon}
                title="扩展信息"
              >
                <FieldGroup className="settings-row-group">
                  <Field className="settings-row" orientation="responsive">
                    <FieldContent>
                      <FieldTitle>应用名称</FieldTitle>
                      <FieldDescription>
                        浏览器清单中展示的完整扩展名称。
                      </FieldDescription>
                    </FieldContent>
                    <span className="settings-value-text">
                      {appConfig.name}
                    </span>
                  </Field>
                  <Separator />
                  <Field className="settings-row" orientation="responsive">
                    <FieldContent>
                      <FieldTitle>当前版本</FieldTitle>
                      <FieldDescription>
                        版本号来自已加载扩展的 manifest。
                      </FieldDescription>
                    </FieldContent>
                    <Badge variant="outline">v{extensionVersion}</Badge>
                  </Field>
                  <Separator />
                  <Field className="settings-row" orientation="responsive">
                    <FieldContent>
                      <FieldTitle>GitHub 仓库</FieldTitle>
                      <FieldDescription>
                        查看源代码、问题追踪与版本更新。
                      </FieldDescription>
                    </FieldContent>
                    {appConfig.github.repositoryUrl ? (
                      <Button
                        render={
                          <a
                            href={appConfig.github.repositoryUrl}
                            rel="noreferrer"
                            target="_blank"
                          />
                        }
                        size="sm"
                        variant="outline"
                      >
                        <GitForkIcon data-icon="inline-start" />
                        查看仓库
                      </Button>
                    ) : (
                      <Badge variant="secondary">未配置</Badge>
                    )}
                  </Field>
                  <Separator />
                  <Field className="settings-row" orientation="responsive">
                    <FieldContent>
                      <FieldTitle>技术栈</FieldTitle>
                      <FieldDescription>
                        使用现代浏览器扩展与 React 工具链构建。
                      </FieldDescription>
                    </FieldContent>
                    <div className="settings-inline-badges">
                      <Badge variant="secondary">WXT</Badge>
                      <Badge variant="secondary">React</Badge>
                      <Badge variant="secondary">TypeScript</Badge>
                    </div>
                  </Field>
                </FieldGroup>
              </SettingsCard>
            </TabsContent>
          </div>
        </div>
      </Tabs>
      <CommandDialog
        className="settings-command-dialog"
        description="搜索并跳转到扩展设置"
        open={isSearchOpen}
        title="搜索设置"
        onOpenChange={updateSearchOpen}
      >
        <Command loop>
          <CommandInput
            autoFocus
            placeholder="搜索设置..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>未找到相关设置</CommandEmpty>
            <CommandGroup heading="设置">
              {settingsSearchItems.map((item) => {
                const Icon = item.icon;
                const section = settingsNavigation.find(
                  (navigationItem) => navigationItem.value === item.value,
                )?.label;

                return (
                  <CommandItem
                    key={item.label}
                    value={[
                      item.label,
                      item.description,
                      ...item.keywords,
                    ].join(' ')}
                    onSelect={() => openSearchResult(item.value)}
                  >
                    <Icon aria-hidden="true" />
                    <span className="settings-command-copy">
                      <span>{item.label}</span>
                      <small>{item.description}</small>
                    </span>
                    <CommandShortcut>{section}</CommandShortcut>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
          <div className="settings-command-footer">
            <span>↑↓ 选择</span>
            <span>↵ 打开</span>
            <span>esc 关闭</span>
          </div>
        </Command>
      </CommandDialog>
    </TooltipProvider>
  );
}
