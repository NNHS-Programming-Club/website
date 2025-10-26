import React, { useRef, useCallback } from 'react';
import './ResizeBar.css';

const ResizeBar = ({ 
  direction = 'vertical', // 'vertical' or 'horizontal'
  onResize, 
  className = '',
  minSize = 100,
  maxSize = null,
  targetElement = null // Optional: specific element to resize
}) => {
  const barRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startPosRef = useRef(0);
  const startSizeRef = useRef(0);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    startPosRef.current = direction === 'vertical' ? e.clientX : e.clientY;
    
    // Get the current size of the panel being resized
    let targetElementToMeasure = targetElement;
    if (!targetElementToMeasure) {
      // Fallback: try to find the target element based on direction
      if (direction === 'vertical') {
        // For vertical resize, look for the previous sibling (left panel)
        targetElementToMeasure = barRef.current.previousElementSibling;
      } else {
        // For horizontal resize, look for the previous sibling (top panel)
        targetElementToMeasure = barRef.current.previousElementSibling;
      }
    }
    
    if (targetElementToMeasure) {
      const rect = targetElementToMeasure.getBoundingClientRect();
      startSizeRef.current = direction === 'vertical' ? rect.width : rect.height;
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = direction === 'vertical' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  }, [direction, targetElement]);

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingRef.current) return;

    const currentPos = direction === 'vertical' ? e.clientX : e.clientY;
    const delta = currentPos - startPosRef.current;
    const newSize = startSizeRef.current + delta;

    // Apply min/max constraints
    let constrainedSize = newSize;
    if (minSize && newSize < minSize) {
      constrainedSize = minSize;
    }
    if (maxSize && newSize > maxSize) {
      constrainedSize = maxSize;
    }

    if (onResize) {
      onResize(constrainedSize);
    }
  }, [direction, minSize, maxSize, onResize]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [handleMouseMove]);

  return (
    <div
      ref={barRef}
      className={`resize-bar resize-bar-${direction} ${className}`}
      onMouseDown={handleMouseDown}
    />
  );
};

export default ResizeBar;
