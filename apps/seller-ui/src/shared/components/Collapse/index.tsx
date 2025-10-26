import { useEffect, useRef, useState } from "react";

function Collapse({
  open,
  children,
  className = "",
  duration = 220,
}: {
  open: boolean;
  children: React.ReactNode;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inlineStyle, setInlineStyle] = useState<React.CSSProperties>({
    height: 0,
    opacity: 0,
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let timeoutId: number | undefined;
    let rafId: number | undefined;

    const contentHeight = el.scrollHeight;

    if (open) {
      setInlineStyle({
        height: contentHeight,
        opacity: 1,
        transition: `height ${duration}ms cubic-bezier(.2,.65,.3,1), opacity ${duration}ms ease`,
      });

      timeoutId = window.setTimeout(() => {
        setInlineStyle({
          height: "auto",
          opacity: 1,
        });
      }, duration);
    } else {
      const startHeight = el.getBoundingClientRect().height;

      setInlineStyle({
        height: startHeight,
        opacity: 1,
      });

      rafId = window.requestAnimationFrame(() => {
        setInlineStyle({
          height: 0,
          opacity: 0.5,
          transition: `height ${duration}ms cubic-bezier(.2,.65,.3,1), opacity ${duration}ms ease`,
        });
      });
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [open, duration]);

  return (
    <div
      ref={ref}
      style={inlineStyle}
      className={`overflow-hidden will-change-[height,opacity] ${className}`}
    >
      <div className="animate-[fadeIn_.14s_ease]">{children}</div>
    </div>
  );
}

export default Collapse;
