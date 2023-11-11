import { useRef, useState } from "react";

export const useNodeRef = <T>() => {
  const ref = useRef<T | null>(null);
  const [mounted, setMounted] = useState(false);

  const mount = (val: T | null) => {
    ref.current = val;
    setMounted(val !== null);
  };

  return [ref, mount] as const;
};
