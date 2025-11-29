"use client";

import { Suspense, useMemo } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, useFBX } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";

import { Loader2 } from "lucide-react";
import { getFileExtension } from "@/lib/utils";

function GLBModel({ url }: { url: string }) {
  const { scene } = useGLTF(url, true);
  return <primitive object={scene} scale={1} />;
}

function OBJModel({ url }: { url: string }) {
  const obj = useLoader(OBJLoader, url);
  return <primitive object={obj} scale={1} />;
}

function FBXModel({ url }: { url: string }) {
  const fbx = useFBX(url);
  return <primitive object={fbx} scale={1} />;
}

function STLModel({ url }: { url: string }) {
  const geometry = useLoader(STLLoader, url);

  // Compute normals if not present
  if (geometry.attributes.normal === undefined) {
    geometry.computeVertexNormals();
  }

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial />
    </mesh>
  );
}

function PLYModel({ url }: { url: string }) {
  const geometry = useLoader(PLYLoader, url);

  // Compute normals if not present
  if (geometry.attributes.normal === undefined) {
    geometry.computeVertexNormals();
  }

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial />
    </mesh>
  );
}

function Model({ url, format }: { url: string; format?: string }) {
  const fileExtension = useMemo(() => {
    // If format is provided, use it
    if (format) {
      return format.toLowerCase();
    }

    // Try to extract from URL
    try {
      // Handle blob URLs - they don't have pathname, so check the URL string
      if (url.startsWith("blob:")) {
        // For blob URLs, we need to check the original file or use format prop
        // Try to match common patterns
        const match = url.match(/\.([a-z0-9]+)/i);
        return match ? match[1].toLowerCase() : "";
      }

      const urlObj = new URL(url);
      const pathname = urlObj.pathname || urlObj.href.split("?")[0];
      return getFileExtension(pathname);
    } catch {
      // If URL parsing fails, try to extract from the URL string
      const match = url.match(/\.([a-z0-9]+)(?:[?#]|$)/i);
      return match ? match[1].toLowerCase() : "";
    }
  }, [url, format]);

  // Use appropriate loader based on file extension
  if (fileExtension === "obj") {
    return <OBJModel url={url} />;
  } else if (fileExtension === "glb" || fileExtension === "gltf") {
    return <GLBModel url={url} />;
  } else if (fileExtension === "fbx") {
    return <FBXModel url={url} />;
  } else if (fileExtension === "stl") {
    return <STLModel url={url} />;
  } else if (fileExtension === "ply") {
    return <PLYModel url={url} />;
  }

  // Default to GLB loader (most common)
  return <GLBModel url={url} />;
}

function LoadingFallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
    </div>
  );
}

export default function ModelViewer({
  src,
  alt: _alt,
  format,
}: {
  src: string;
  alt?: string;
  format?: string;
}) {
  if (!src) {
    return <LoadingFallback />;
  }

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Model url={src} format={format} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={50}
          />
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
    </div>
  );
}
