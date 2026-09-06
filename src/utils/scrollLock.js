let openModalsCount = 0;

export const lockScroll = () => {
  openModalsCount++;
  document.body.style.overflow = "hidden";
};

export const unlockScroll = () => {
  openModalsCount = Math.max(0, openModalsCount - 1);
  if (openModalsCount === 0) {
    document.body.style.overflow = "unset";
  }
};