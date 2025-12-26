import { useSensors, useSensor, PointerSensor } from '@dnd-kit/core';

/**
 * Custom hook for drag-and-drop sensors and configuration
 */
export function useDragDrop() {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum 8px movement to start drag (prevents accidental drags)
      },
    })
  );

  return { sensors };
}
