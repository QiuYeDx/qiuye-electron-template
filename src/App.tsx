import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Route, Routes, useLocation } from "react-router-dom";
import "@/App.css";
import About from "@/pages/About";
import Home from "@/pages/Home";
import Setting from "@/pages/Setting";
import BottomNavigation from "@/pages/components/BottomNavigation";
import AppTitleBar from "@/pages/components/AppTitleBar";
import FadeMaskLayer from "@/pages/components/FadeMaskLayer";
import { Toaster } from "@/components/ui/sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import Update from "@/components/update";
import useUpdatePreferencesStore from "@/store/useUpdatePreferencesStore";

const ROUTE_ORDER: Record<string, number> = {
  "/": 0,
  "/about": 1,
  "/setting": 2,
};

function getRouteIndex(pathname: string): number {
  return ROUTE_ORDER[pathname] ?? -1;
}

const SLIDE_OFFSET = 48;

const pageVariants = {
  enter: (direction: number) => ({
    left: direction * SLIDE_OFFSET,
    opacity: 0,
  }),
  center: {
    left: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    left: -direction * SLIDE_OFFSET,
    opacity: 0,
  }),
};

const pageTransition = {
  type: "spring" as const,
  duration: 0.3,
  bounce: 0,
};

function App() {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  const directionRef = useRef(1);
  const { autoCheck } = useUpdatePreferencesStore();

  if (prevPathRef.current !== location.pathname) {
    const prevIndex = getRouteIndex(prevPathRef.current);
    const nextIndex = getRouteIndex(location.pathname);
    directionRef.current = nextIndex > prevIndex ? 1 : -1;
    prevPathRef.current = location.pathname;
  }

  return (
    <div className="app flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <AppTitleBar />
      <div className="h-10" />

      <ScrollArea className="h-full flex-1">
        <div className="w-screen overflow-x-clip pt-10">
          <AnimatePresence
            mode="wait"
            custom={directionRef.current}
            initial={false}
          >
            <motion.div
              key={location.pathname}
              custom={directionRef.current}
              className="relative"
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={pageTransition}
            >
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/setting" element={<Setting />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </ScrollArea>

      <BottomNavigation />
      <Toaster position="top-right" />
      <Update autoCheck={autoCheck} showTrigger={false} />
      <FadeMaskLayer />
    </div>
  );
}

export default App;

