import { animateEnter, animateStagger, animateModalOpen, animateModalClose } from './animations';

describe('Animation utilities', () => {
  it('handles null elements safely without throwing', () => {
    expect(() => animateEnter(null)).not.toThrow();
    expect(animateEnter(null)).toBeUndefined();
    expect(() => animateStagger([])).not.toThrow();
    expect(animateStagger([])).toBeUndefined();
    expect(() => animateStagger([null, null])).not.toThrow();
    expect(animateStagger([null, null])).toBeUndefined();
    expect(() => animateModalOpen(null, null)).not.toThrow();
    expect(() => animateModalClose(null, null)).not.toThrow();
  });

  it('executes onComplete callback exactly once when animateModalClose has null elements', () => {
    const onComplete = jest.fn();
    animateModalClose(null, null, onComplete);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('animates DOM elements without throwing and returns tweens', () => {
    const el1 = document.createElement('div');
    const el2 = document.createElement('div');

    const enterTween = animateEnter(el1, 0.1);
    expect(enterTween).toBeDefined();

    const staggerTween = animateStagger([el1, el2], 0.05);
    expect(staggerTween).toBeDefined();

    expect(() => animateModalOpen(el1, el2)).not.toThrow();

    const onComplete = jest.fn();
    expect(() => animateModalClose(el1, el2, onComplete)).not.toThrow();
  });
});
