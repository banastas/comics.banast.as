import type { KeyboardEvent } from 'react';

export const handleKeyboardActivation = (
  event: KeyboardEvent<HTMLElement>,
  activate: () => void,
): void => {
  if (event.key !== 'Enter' && event.key !== ' ') return;

  event.preventDefault();
  activate();
};
