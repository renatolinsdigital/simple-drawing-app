export const strokeOptions = {
  size: 5,
  thinning: 0.21,
  smoothing: 0.92,
  streamline: 0.25,
  easing: (t: any) => 1 - --t * t * t * t,
  simulatePressure: true,
  start: {
    taper: 11,
    cap: false,
  },
  end: {
    taper: 1,
    cap: true,
  },
};
