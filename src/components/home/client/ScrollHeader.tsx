import { useState, useEffect } from "react";
import { useScroll } from "framer-motion";

interface ScrollHeaderProps {
  children: React.ReactNode;
}

export default function ScrollHeader({ children }: ScrollHeaderProps) {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      setIsScrolled(latest > 0);
    });

    return () => {
      unsubscribe();
    };
  }, [scrollY]);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-200 ${
        isScrolled
          ? "border-b border-border/70 bg-background/85 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/70"
          : "bg-transparent"
      }`}
    >
      {children}
    </header>
  );
}
