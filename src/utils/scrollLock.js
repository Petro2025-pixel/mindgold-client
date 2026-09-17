/**
 * Scroll lock manager.
 *
 * Uses a counter to handle multiple concurrently open modals:
 * the body is only unlocked once the last modal closes.
 * The original overflow value is preserved and restored on unlock.
 */

let openModalsCount = 0;
let originalOverflow = "";

/**
 * Lock body scroll. Increments the open modal counter.
 * Sets `overflow: hidden` only on the first lock.
 */
export const lockScroll = () => {
  if (openModalsCount === 0) {
    originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  openModalsCount++;
};

/**
 * Unlock body scroll. Decrements the open modal counter.
 * Restores the original overflow value once the counter hits 0.
 */
export const unlockScroll = () => {
  openModalsCount = Math.max(0, openModalsCount - 1);
  if (openModalsCount === 0) {
    document.body.style.overflow = originalOverflow;
  }
};
