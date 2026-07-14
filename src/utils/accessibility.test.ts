import { describe, expect, it, vi } from 'vitest';
import type { KeyboardEvent } from 'react';
import { handleKeyboardActivation } from './accessibility';

const keyboardEvent = (key: string) => ({
  key,
  preventDefault: vi.fn(),
}) as unknown as KeyboardEvent<HTMLElement>;

describe('keyboard activation', () => {
  it.each(['Enter', ' '])('activates controls for %j', (key) => {
    const event = keyboardEvent(key);
    const activate = vi.fn();

    handleKeyboardActivation(event, activate);

    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(activate).toHaveBeenCalledOnce();
  });

  it('ignores unrelated keys', () => {
    const event = keyboardEvent('ArrowDown');
    const activate = vi.fn();

    handleKeyboardActivation(event, activate);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(activate).not.toHaveBeenCalled();
  });
});
