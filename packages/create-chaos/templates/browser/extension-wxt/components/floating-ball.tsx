import {
  PanelRightOpenIcon,
  Settings2Icon,
  SparklesIcon,
  XIcon,
} from 'lucide-react';
import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import { appConfig } from '@/config/app-config';
import { useExtensionSettings } from '@/hooks/use-extension-settings';
import { useExtensionTheme } from '@/hooks/use-extension-theme';
import type { ExtensionMessage } from '@/lib/extension-messages';
import { cn } from '@/lib/utils';

function sendMessage(message: ExtensionMessage) {
  return browser.runtime.sendMessage(message);
}

interface Point {
  x: number;
  y: number;
}

interface DragStart extends Point {
  pointerId: number;
  startX: number;
  startY: number;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function FloatingBall() {
  const { isReady, settings, updateSettings } = useExtensionSettings();
  const resolvedTheme = useExtensionTheme(settings.theme);
  const [isOpen, setIsOpen] = useState(false);
  const [dragPosition, setDragPosition] = useState<Point | null>(null);
  const [viewport, setViewport] = useState(() => ({
    height: window.innerHeight,
    width: window.innerWidth,
  }));
  const dragPositionRef = useRef<Point | null>(null);
  const dragStartRef = useRef<DragStart | null>(null);
  const ignoreClickRef = useRef(false);

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isReady || !settings.floatingBallEnabled) {
    return null;
  }

  const isLeft = settings.floatingBallPosition === 'bottom-left';
  const { offset } = appConfig.surfaces.floatingBall;
  const availableHeight = Math.max(
    0,
    viewport.height - settings.floatingBallSize - offset * 2,
  );
  const restingTop =
    offset + availableHeight * settings.floatingBallVerticalRatio;
  const positionStyle: CSSProperties = {
    height: settings.floatingBallSize,
    top: dragPosition?.y ?? restingTop,
    width: settings.floatingBallSize,
    ...(dragPosition
      ? { left: dragPosition.x }
      : { [isLeft ? 'left' : 'right']: offset }),
  };

  const openSidePanel = async () => {
    await sendMessage({ type: 'scaffold:open-side-panel' });
    setIsOpen(false);
  };

  const openOptions = async () => {
    await sendMessage({ type: 'scaffold:open-options' });
    setIsOpen(false);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const position = { x: bounds.left, y: bounds.top };
    dragStartRef.current = {
      ...position,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };
    dragPositionRef.current = position;
    setDragPosition(position);
    setIsOpen(false);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const start = dragStartRef.current;
    if (!start || start.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - start.startX;
    const deltaY = event.clientY - start.startY;
    if (Math.hypot(deltaX, deltaY) > 4) {
      ignoreClickRef.current = true;
    }

    const nextPosition = {
      x: clamp(
        start.x + deltaX,
        offset,
        Math.max(offset, viewport.width - settings.floatingBallSize - offset),
      ),
      y: clamp(
        start.y + deltaY,
        offset,
        Math.max(offset, viewport.height - settings.floatingBallSize - offset),
      ),
    };
    dragPositionRef.current = nextPosition;
    setDragPosition(nextPosition);
  };

  const finishDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const start = dragStartRef.current;
    const position = dragPositionRef.current;
    if (!start || !position || start.pointerId !== event.pointerId) {
      return;
    }

    const nextIsLeft =
      position.x + settings.floatingBallSize / 2 < viewport.width / 2;
    const nextVerticalRatio =
      availableHeight > 0 ? (position.y - offset) / availableHeight : 0;

    dragStartRef.current = null;
    dragPositionRef.current = null;
    setDragPosition(null);
    updateSettings({
      floatingBallPosition: nextIsLeft ? 'bottom-left' : 'bottom-right',
      floatingBallVerticalRatio: clamp(nextVerticalRatio, 0, 1),
    });

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const toggleMenu = () => {
    if (ignoreClickRef.current) {
      ignoreClickRef.current = false;
      return;
    }

    setIsOpen((current) => !current);
  };

  return (
    <div
      className={cn(
        'floating-launcher',
        isLeft && 'floating-launcher-left',
        dragPosition && 'floating-launcher-dragging',
        resolvedTheme === 'dark' && 'dark',
        resolvedTheme === 'light' && 'light',
      )}
      style={positionStyle}
    >
      {isOpen ? (
        <div className="floating-menu" role="dialog" aria-label="扩展快捷菜单">
          <div className="floating-menu-header">
            <span className="floating-menu-title">
              <strong>{appConfig.shortName}</strong>
              <small>QUICK ACCESS</small>
            </span>
            <button
              aria-label="关闭快捷菜单"
              className="icon-button"
              type="button"
              onClick={() => setIsOpen(false)}
            >
              <XIcon aria-hidden="true" />
            </button>
          </div>
          <button type="button" onClick={openSidePanel}>
            <PanelRightOpenIcon aria-hidden="true" />
            打开侧边栏
          </button>
          <button type="button" onClick={openOptions}>
            <Settings2Icon aria-hidden="true" />
            显示设置
          </button>
        </div>
      ) : null}

      <button
        aria-expanded={isOpen}
        aria-label={`打开 ${appConfig.name}`}
        className="floating-ball"
        style={{
          height: settings.floatingBallSize,
          width: settings.floatingBallSize,
        }}
        type="button"
        onClick={toggleMenu}
        onPointerCancel={finishDrag}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
      >
        <SparklesIcon aria-hidden="true" />
      </button>
    </div>
  );
}
