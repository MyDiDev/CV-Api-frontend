import { animateEnter, animateStagger, animateModalOpen, animateModalClose } from './animations';

describe('Animation utilities', () => {
  it('handles null elements safely without throwing', () => {
    expect(() => animateEnter(null)).not.toThrow();
    expect(() => animateStagger([])).not.toThrow();
    expect(() => animateStagger([null, null])).not.toThrow();
    expect(() => animateModalOpen(null, null)).not.toThrow();
    expect(() => animateModalClose(null, null)).not.toThrow();
  });

  it('executes onComplete callback when animateModalClose has null elements', () => {
    const onComplete = jest.fn();
    animateModalClose(null, null, onComplete);
    expect(onComplete).toHaveBeenCalled();
  });

  it('animates DOM elements without throwing', () => {
    const el1 = document.createElement('div');
    const el2 = document.createElement('div');

    expect(() => animateEnter(el1, 0.1)).not.toThrow();
    expect(() => animateStagger([el1, el2], 0.05)).not.toThrow();
    expect(() => animateModalOpen(el1, el2)).not.toThrow();

    const onComplete = jest.fn();
    expect(() => animateModalClose(el1, el2, onComplete)).not.toThrow();
  });
});
