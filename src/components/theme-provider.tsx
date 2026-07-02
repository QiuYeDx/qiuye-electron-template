import * as React from "react";
import useThemeStore from "@/store/useThemeStore";

export function ThemeProvider({ children }: React.PropsWithChildren) {
  const { theme, setTheme } = useThemeStore();

  React.useEffect(() => {
    setTheme(theme);
  }, [setTheme, theme]);

  return <>{children}</>;
}

