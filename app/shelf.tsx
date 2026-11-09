"use client";

import {
  Fragment,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { positionShelfCaption, type Bounds, type CaptionPosition } from "./shelf-caption";
import { shelfItems } from "./shelf-items";

// Include every visible object and the floor, excluding the PNG's empty margins.
const sceneBounds = { left: 106, top: 16, right: 1665, bottom: 720 };

function readSilhouetteRows(image: HTMLImageElement): Bounds[] | null {
  if (!image.complete || !image.naturalWidth) return null;
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.drawImage(image, 0, 0);
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  const rows: Bounds[] = [];
  for (let y = 0; y < canvas.height; y++) {
    let left = canvas.width;
    let right = 0;
    for (let x = 0; x < canvas.width; x++) {
      if (data[(y * canvas.width + x) * 4 + 3] >= 16) {
        left = Math.min(left, x);
        right = x + 1;
      }
    }
    if (right > left) rows.push({ left, right, top: y, bottom: y + 1 });
  }
  return rows;
}

export default function Shelf() {
  const [active, setActive] = useState(false);
  const [selectedItem, setSelectedItem] = useState(shelfItems[0]);
  const [position, setPosition] = useState<CaptionPosition | null>(null);
  const captionId = useId();
  const shelfRef = useRef<HTMLDivElement>(null);
  const silhouetteRows = useRef<Bounds[] | null>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerType = useRef("");

  function cancelClose() {
    if (closeTimer.current !== null) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function showCaption(item: typeof selectedItem) {
    cancelClose();
    setSelectedItem(item);
    setActive(true);
  }

  function scheduleClose() {
    cancelClose();
    // Keyboard focus keeps the description available even if the pointer leaves.
    if (shelfRef.current?.querySelector(".shelf-item-trigger:focus-visible")) return;
    closeTimer.current = setTimeout(() => setActive(false), 180);
  }

  useLayoutEffect(() => {
    if (!active) return;
    const shelf = shelfRef.current;
    const caption = captionRef.current;
    const image = shelf?.querySelector("img");
    if (!shelf || !caption) return;
    let frame = 0;

    function updatePosition() {
      if (!shelf || !caption) return;
      const bounds = shelf.getBoundingClientRect();
      const scaleX = bounds.width / 1792;
      const scaleY = bounds.height / 742;
      const toScreen = (rect: typeof sceneBounds) => ({
        left: bounds.left + rect.left * scaleX,
        top: bounds.top + rect.top * scaleY,
        right: bounds.left + rect.right * scaleX,
        bottom: bounds.top + rect.bottom * scaleY,
      });
      if (!silhouetteRows.current && image) {
        silhouetteRows.current = readSilhouetteRows(image);
      }
      const placement = positionShelfCaption(
        toScreen(sceneBounds),
        toScreen(selectedItem.bounds),
        caption.getBoundingClientRect(),
        { width: document.documentElement.clientWidth, height: window.innerHeight },
        silhouetteRows.current?.map(toScreen),
      );
      setPosition({
        ...placement,
        left: placement.left - bounds.left,
        top: placement.top - bounds.top,
      });
    }

    function schedulePosition() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updatePosition);
    }

    updatePosition();
    const observer = new ResizeObserver(schedulePosition);
    observer.observe(shelf);
    observer.observe(caption);
    window.addEventListener("resize", schedulePosition);
    window.addEventListener("scroll", schedulePosition, true);
    image?.addEventListener("load", schedulePosition);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedulePosition);
      window.removeEventListener("scroll", schedulePosition, true);
      image?.removeEventListener("load", schedulePosition);
    };
  }, [active, selectedItem]);

  useEffect(() => {
    function dismiss(event: PointerEvent | KeyboardEvent) {
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      if (
        event instanceof PointerEvent &&
        event.target instanceof Node &&
        ((event.target instanceof Element &&
          event.target.closest(".shelf-item-trigger") &&
          shelfRef.current?.contains(event.target)) ||
          captionRef.current?.contains(event.target))
      ) {
        return;
      }
      if (closeTimer.current !== null) clearTimeout(closeTimer.current);
      setActive(false);
    }

    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", dismiss);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", dismiss);
      if (closeTimer.current !== null) clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <div className="divider">
      <div ref={shelfRef} className="shelf" data-active={active} data-item={selectedItem.id}>
        <img
          src="./assets/shelf.png"
          alt="A shelf of my favorite things"
          width="1792"
          height="742"
          loading="lazy"
        />
        <div className="lamp-beam" aria-hidden="true" />
        <div className="shelf-floor" aria-hidden="true" />
        {shelfItems.map((item) => (
          <Fragment key={item.id}>
            <button
              className="shelf-item-trigger"
              data-item={item.id}
              data-active={active && selectedItem.id === item.id}
              style={{ clipPath: item.hitArea }}
              type="button"
              aria-label={item.label}
              aria-describedby={active && selectedItem.id === item.id ? captionId : undefined}
              aria-expanded={active && selectedItem.id === item.id}
              aria-controls={captionId}
              onPointerEnter={(event) => {
                if (event.pointerType !== "touch") showCaption(item);
              }}
              onPointerLeave={(event) => {
                if (event.pointerType !== "touch") scheduleClose();
              }}
              onPointerDown={(event) => {
                pointerType.current = event.pointerType;
              }}
              onFocus={(event) => {
                if (event.currentTarget.matches(":focus-visible")) {
                  pointerType.current = "";
                  showCaption(item);
                }
              }}
              onBlur={(event) => {
                // Tapping the caption blurs the button without focusing a new element.
                // Outside taps are already handled by the document listener.
                if (event.relatedTarget || pointerType.current !== "touch") {
                  scheduleClose();
                }
              }}
              onClick={(event) => {
                cancelClose();
                setSelectedItem(item);
                if (pointerType.current === "touch" && event.detail !== 0) {
                  setActive((previous) => (selectedItem.id === item.id ? !previous : true));
                } else {
                  setActive(true);
                }
              }}
            />
            <svg
              className="shelf-outline"
              viewBox="0 0 1792 742"
              aria-hidden="true"
              focusable="false"
            >
              <polygon points={item.outlinePoints} vectorEffect="non-scaling-stroke" />
            </svg>
          </Fragment>
        ))}
        <div
          ref={captionRef}
          className="shelf-caption"
          data-side={position?.side}
          data-ready={position !== null}
          style={
            position
              ? ({
                  left: position.left,
                  top: position.top,
                  "--caption-arrow-offset": `${position.arrowOffset}px`,
                } as CSSProperties)
              : undefined
          }
          onPointerEnter={(event) => {
            if (event.pointerType !== "touch") cancelClose();
          }}
          onPointerLeave={(event) => {
            if (event.pointerType !== "touch") scheduleClose();
          }}
        >
          <div id={captionId} className="shelf-caption-bubble" role="tooltip">
            {selectedItem.caption}
          </div>
        </div>
      </div>
    </div>
  );
}
