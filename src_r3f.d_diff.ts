--- src/r3f.d.ts (原始)


+++ src/r3f.d.ts (修改后)
import { ThreeElements } from '@react-three/fiber';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
