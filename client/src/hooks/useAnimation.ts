import { useSpring, useSpringValue } from '@react-spring/web';
import { useEffect } from 'react';

export interface AnimationConfig {
  tension?: number;
  friction?: number;
  mass?: number;
}

export function usePositionAnimation(x: number, y: number, config?: AnimationConfig) {
  return useSpring({
    x,
    y,
    config: {
      tension: config?.tension ?? 200,
      friction: config?.friction ?? 20,
      mass: config?.mass ?? 1
    }
  });
}

export function useHealthAnimation(health: number, config?: AnimationConfig) {
  return useSpring({
    health,
    config: {
      tension: config?.tension ?? 180,
      friction: config?.friction ?? 20,
      mass: config?.mass ?? 1
    }
  });
}

export function useFlashAnimation(trigger: boolean, duration = 300) {
  const opacity = useSpringValue(0);

  useEffect(() => {
    if (trigger) {
      opacity.start(1);
      setTimeout(() => {
        opacity.start(0);
      }, duration);
    }
  }, [trigger, duration, opacity]);

  return opacity;
}

export function usePulseAnimation(active: boolean) {
  return useSpring({
    scale: active ? 1.1 : 1.0,
    opacity: active ? 1.0 : 0.8,
    config: {
      tension: 300,
      friction: 10
    }
  });
}
