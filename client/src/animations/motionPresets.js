/** Shared Motion variants so every component enters the same way. */

export const EASE = [0.22, 1, 0.36, 1];

export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.35, ease: EASE },
};

export const listStagger = {
  animate: { transition: { staggerChildren: 0.05 } },
};

export const listItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};
