"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { Loader2 } from "lucide-react";

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url, true);
  return <primitive object={scene} scale={1} />;
}

function LoadingFallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
    </div>
  );
}

export default function ModelViewer({ src }: { src: string; alt: string }) {
  if (!src) {
    return <LoadingFallback />;
  }

  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <Suspense fallback={<LoadingFallback />}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Model url={src} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={10}
        />
        <Environment preset="sunset" />
      </Suspense>
    </Canvas>
  );
}
