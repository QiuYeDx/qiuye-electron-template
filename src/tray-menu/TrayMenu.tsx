import { motion, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { AppWindow, Check, Power } from "lucide-react";
import { resolveInitialLanguage } from "@/i18n/constants";
import { cn } from "@/lib/utils";
import useCursorStore from "@/store/useCursorStore";
import useThemeStore from "@/store/useThemeStore";
import type { ThemeValue } from "@/utils/common";
import { TRAY_MENU_SHADOW_MARGIN, type TrayMenuAction, type TrayMenuState } from "./shared";

declare global {
  interface Window {
    trayMenuApi: {
      on: (channel: string, listener: (...args: never[]) => void) => () => void;
      send: (channel: string, ...args: unknown[]) => void;
    };
  }
}

const send = (action: TrayMenuAction) => window.trayMenuApi.send("tray-menu:action", action);

const SHOWN = { opacity: 1, scale: 1, y: 0 };
const HIDDEN = { opacity: 0, scale: 0.97, y: 4 };

const THEMES: ReadonlyArray<{ value: ThemeValue; labelKey: string }> = [
  { value: "light", labelKey: "setting:fields.light_mode" },
  { value: "dark", labelKey: "setting:fields.dark_mode" },
  { value: "system", labelKey: "setting:fields.system_mode" },
];

/** Resolve after the current DOM has been painted (the frame after next is on screen). */
const afterPaint = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

function Item({
  icon,
  children,
  onSelect,
  role = "menuitem",
  checked,
}: {
  icon?: ReactNode;
  children: ReactNode;
  onSelect: () => void;
  role?: "menuitem" | "menuitemcheckbox" | "menuitemradio";
  checked?: boolean;
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={checked}
      data-menu-item
      onClick={onSelect}
      // Hover moves focus, as in shadcn's DropdownMenu, so mouse and keyboard share one highlight.
      onPointerMove={(event) => event.currentTarget.focus({ preventScroll: true })}
      className={cn(
        // 8px = the surface's 12px corner minus its 4px padding, so the highlight nests evenly.
        "relative flex h-8 w-full items-center gap-2 rounded-smooth-md px-2 text-left text-[13px] outline-none",
        "transition-colors duration-100 focus:bg-accent focus:text-accent-foreground",
        "disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0"
      )}
    >
      <span className="flex size-4 items-center justify-center text-muted-foreground">{icon}</span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </button>
  );
}

const Separator = () => <div role="separator" className="-mx-1 my-1 h-px bg-border" />;

/**
 * The tray icon's menu (see electron/main/tray-menu.ts). The surface is shown
 * only between `tray-menu:open` and `tray-menu:hide`, so the window is always
 * hidden, and later reappears, with nothing drawn.
 */
function TrayMenu() {
  const { t, i18n } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const [state, setState] = useState<TrayMenuState | null>(null);
  const [open, setOpen] = useState(false);
  const closingRef = useRef(false);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const api = window.trayMenuApi;
    const offs = [
      api.on("tray-menu:state", (next: TrayMenuState) => {
        // Pick up language, theme and pointer changes made in the main window.
        void i18n.changeLanguage(resolveInitialLanguage());
        void useThemeStore.persist.rehydrate();
        void useCursorStore.persist.rehydrate();
        setState(next);
      }),
      api.on("tray-menu:open", () => {
        closingRef.current = false;
        setOpen(true);
        // Focus the menu (not an item) so keyboard users can start with ↓.
        surfaceRef.current?.focus({ preventScroll: true });
      }),
      api.on("tray-menu:hide", () => {
        closingRef.current = true;
        setOpen(false);
      }),
    ];
    return () => offs.forEach((off) => off());
  }, [i18n]);

  // After every render with new state, report the exact size so the window fits.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!state || !root) return;
    // Layout size, unaffected by the entrance scale transform.
    window.trayMenuApi.send("tray-menu:ready", { width: root.offsetWidth, height: root.offsetHeight });
  }, [state, i18n.resolvedLanguage]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      window.trayMenuApi.send("tray-menu:close");
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const items = [...(surfaceRef.current?.querySelectorAll<HTMLButtonElement>("[data-menu-item]:not(:disabled)") ?? [])];
    if (items.length === 0) return;
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      event.key === "ArrowDown"
        ? items[(index + 1) % items.length]
        : items[(index - 1 + items.length) % items.length];
    next.focus();
  };

  // Once the faded-out menu is on screen, the window may be hidden.
  const onAnimationComplete = () => {
    if (!closingRef.current) return;
    closingRef.current = false;
    void afterPaint().then(() => window.trayMenuApi.send("tray-menu:hidden"));
  };

  if (!state) return null;

  return (
    // The margin holds the shadow; a click there counts as a click outside the menu.
    <div
      ref={rootRef}
      className="inline-block"
      style={{ padding: TRAY_MENU_SHADOW_MARGIN }}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) window.trayMenuApi.send("tray-menu:close");
      }}
    >
      <motion.div
        ref={surfaceRef}
        role="menu"
        tabIndex={-1}
        onKeyDown={onKeyDown}
        initial={HIDDEN}
        animate={open ? SHOWN : HIDDEN}
        transition={
          reduceMotion || !open
            ? { duration: reduceMotion ? 0 : 0.1, ease: "easeOut" }
            : { type: "spring", duration: 0.22, bounce: 0 }
        }
        onAnimationComplete={onAnimationComplete}
        style={{ transformOrigin: "bottom right" }}
        // Both shadows end inside the margin: the soft one reaches 8px above, 16px to
        // the sides and 24px below the surface.
        className="w-[236px] rounded-smooth-[12px] border bg-popover p-1 text-popover-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_20px_-4px_rgba(0,0,0,0.16)] outline-none dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_20px_-4px_rgba(0,0,0,0.5)]"
      >
        <Item icon={<AppWindow />} onSelect={() => send({ type: "toggleWindow" })}>
          {state.windowVisible ? t("common:tray.hide_window") : t("common:tray.show_window")}
        </Item>
        <Separator />
        <div className="px-2 pt-1 pb-1 text-[11px] font-medium text-muted-foreground">
          {t("common:tray.theme")}
        </div>
        {THEMES.map((item) => (
          <Item
            key={item.value}
            role="menuitemradio"
            checked={theme === item.value}
            icon={theme === item.value ? <Check className="text-foreground" /> : null}
            // Saved to localStorage; the main window follows through its storage listener.
            onSelect={() => {
              setTheme(item.value);
              window.trayMenuApi.send("tray-menu:close");
            }}
          >
            {t(item.labelKey)}
          </Item>
        ))}
        <Separator />
        <Item icon={<Power />} onSelect={() => send({ type: "quit" })}>
          {t("common:tray.quit")}
        </Item>
      </motion.div>
    </div>
  );
}

export default TrayMenu;
