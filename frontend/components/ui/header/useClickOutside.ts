"use client";

import { useEffect, useRef } from "react";

export function useClickOutside<T extends HTMLElement>(onOutside: () => void) {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const element = elementRef.current;
      const target = event.target;

      if (!element || !(target instanceof Node) || element.contains(target)) {
        return;
      }

      onOutside();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [onOutside]);

  return elementRef;
}
