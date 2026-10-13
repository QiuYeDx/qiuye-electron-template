import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/** How clickable elements show the mouse cursor: the hand (pointer) or the regular arrow (default). */
export type ClickableCursor = "pointer" | "default";

interface CursorStore {
  clickableCursor: ClickableCursor;
  setClickableCursor: (cursor: ClickableCursor) => void;
}

const STORAGE_KEY = "qiuye-electron-template-cursor";

/** index.css reads html[data-cursor] to style every clickable element (see "可点击元素的鼠标指针" in index.css). */
function applyClickableCursor(cursor: ClickableCursor) {
  if (typeof document !== "undefined") document.documentElement.dataset.cursor = cursor;
}

const useCursorStore = create<CursorStore>()(
  persist(
    (set) => ({
      clickableCursor: "pointer",
      setClickableCursor: (clickableCursor) => set({ clickableCursor }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ clickableCursor: state.clickableCursor }),
    }
  )
);

// localStorage hydrates synchronously, so the attribute is set before the first render.
applyClickableCursor(useCursorStore.getState().clickableCursor);
useCursorStore.subscribe((state) => applyClickableCursor(state.clickableCursor));

// Other windows of the app (such as the tray menu) follow a change made in Settings.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) void useCursorStore.persist.rehydrate();
  });
}

export default useCursorStore;
