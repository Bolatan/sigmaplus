import React from 'react';

module.exports = {
  DndProvider: ({ children }) => <div>{children}</div>,
  useDrag: () => [{}, jest.fn()],
  useDrop: () => [{}, jest.fn()],
};
