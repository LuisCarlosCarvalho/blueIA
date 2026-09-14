import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Float, Box, Sphere } from '@react-three/drei'

interface ThreeJsProps {
  sceneType?: 'box' | 'sphere' | 'abstract'
  color?: string
  scale?: number
}

function BasicScene({ sceneType, color, scale }: ThreeJsProps) {
  const meshRef = useRef<any>(null)
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2
      meshRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      {sceneType === 'sphere' ? (
        <Sphere ref={meshRef} args={[1.5 * (scale || 1), 64, 64]}>
          <meshStandardMaterial color={color || '#3b82f6'} roughness={0.1} metalness={0.8} />
        </Sphere>
      ) : (
        <Box ref={meshRef} args={[2 * (scale || 1), 2 * (scale || 1), 2 * (scale || 1)]}>
          <meshStandardMaterial color={color || '#3b82f6'} roughness={0.2} metalness={0.5} />
        </Box>
      )}
    </Float>
  )
}

export function ThreeJsBlock({ props }: { props: Record<string, any> }) {
  const { sceneType = 'abstract', color = '#3b82f6', height = '400px' } = props

  return (
    <div style={{ width: '100%', height, position: 'relative' }} className="rounded-xl overflow-hidden bg-black/5">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="city" />
        <BasicScene sceneType={sceneType as 'box' | 'sphere'} color={color} scale={props.scale} />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  )
}
