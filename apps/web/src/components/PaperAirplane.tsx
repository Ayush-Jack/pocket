'use client'

import { Canvas } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { forwardRef, Suspense, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

const MODEL_URL = '/models/clay_airplane.glb'

export type PaperAirplaneHandle = {
  setFlight: (pose: { bank: number; scale?: number }) => void
}

export const PaperAirplane = forwardRef<PaperAirplaneHandle, { className?: string }>(function PaperAirplane({ className }, ref) {
  const groupRef = useRef<THREE.Group>(null)
  const invalidateRef = useRef<() => void>(() => {})
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useImperativeHandle(ref, () => ({
    setFlight({ bank, scale = 1 }) {
      const group = groupRef.current
      if (!group) return
      group.rotation.z = THREE.MathUtils.degToRad(bank)
      group.scale.setScalar(scale)
      invalidateRef.current()
    },
  }))

  return (
    <Canvas
      className={className}
      frameloop={reduced ? 'demand' : 'always'}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0.85, 1.55, 2.2], fov: 34, near: 0.1, far: 20 }}
      onCreated={({ gl, camera, invalidate }) => {
        gl.setClearColor(0x000000, 0)
        gl.outputColorSpace = THREE.SRGBColorSpace
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1
        camera.lookAt(0, -0.28, 0)
        invalidateRef.current = invalidate
        invalidate()
      }}
    >
      <hemisphereLight args={['#fff9f3', '#b7a4d4', 0.55]} />
      <directionalLight position={[2.4, 1.7, 0.55]} intensity={1.85} color="#fff6ea" />
      <directionalLight position={[-1.8, 2.4, 1.2]} intensity={0.62} color="#e4dcff" />
      <directionalLight position={[0.2, 0.15, -2.2]} intensity={0.32} color="#d5e4f6" />
      <group rotation={[-0.38, 0.48, 0]}>
        <group ref={groupRef}>
          <Suspense fallback={null}>
            <LoadedPlane />
          </Suspense>
        </group>
      </group>
    </Canvas>
  )
})

function LoadedPlane() {
  const { scene } = useGLTF(MODEL_URL)
  const model = useMemo(() => prepareModel(scene), [scene])

  return <primitive object={model} scale={0.5} rotation={[0.2, Math.PI / 2, 0]} />
}

function prepareModel(scene: THREE.Group) {
  const model = scene.clone(true)
  model.traverse((child) => {
    const mesh = child as THREE.Mesh
    if (!mesh.isMesh) return
    const source = mesh.material
    const list = Array.isArray(source) ? source : [source]
    const cloned = list.map((item) => {
      const material = (item as THREE.Material).clone()
      const standard = material as THREE.MeshStandardMaterial
      if (standard.isMeshStandardMaterial) {
        standard.metalness = 0
        standard.envMapIntensity = 0.16
      }
      return material
    })
    mesh.material = Array.isArray(source) ? cloned : cloned[0]
  })
  return model
}

useGLTF.preload(MODEL_URL)
