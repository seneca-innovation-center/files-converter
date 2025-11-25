import "@react-three/fiber";

// Extend React Three Fiber to suppress SVG warnings
// This is needed because React Three Fiber validates JSX elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Allow all elements - React Three Fiber will validate at runtime
      [elemName: string]: unknown;
    }
  }
}
