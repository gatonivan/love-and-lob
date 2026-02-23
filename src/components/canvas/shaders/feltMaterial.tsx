import { useMemo } from 'react'
import * as THREE from 'three'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import { MeshPhysicalMaterial } from 'three'
import vertexShader from '../../../shaders/deform.vert'
import fragmentShader from '../../../shaders/deform.frag'

export interface FeltMaterialUniforms {
  uGrabPoint: THREE.Vector3
  uDragDelta: THREE.Vector3
  uGrabStrength: number
  uGrabRadius: number
  uTime: number
  uMaxStretch: number
}

const DEFAULTS: FeltMaterialUniforms = {
  uGrabPoint: new THREE.Vector3(0, 0, 0),
  uDragDelta: new THREE.Vector3(0, 0, 0),
  uGrabStrength: 0,
  uGrabRadius: 0.8,
  uTime: 0,
  uMaxStretch: 1.5,
}

export function createFeltMaterial(overrides?: Partial<FeltMaterialUniforms>) {
  const vals = { ...DEFAULTS, ...overrides }

  const uniforms = {
    uGrabPoint: { value: vals.uGrabPoint.clone() },
    uDragDelta: { value: vals.uDragDelta.clone() },
    uGrabStrength: { value: vals.uGrabStrength },
    uGrabRadius: { value: vals.uGrabRadius },
    uTime: { value: vals.uTime },
    uMaxStretch: { value: vals.uMaxStretch },
  }

  const material = new CustomShaderMaterial({
    baseMaterial: MeshPhysicalMaterial,
    vertexShader,
    fragmentShader,
    uniforms,
    // PBR felt properties — tuned for hyper-realistic tennis ball
    color: new THREE.Color('#c4d82e'),
    roughness: 0.85,
    metalness: 0,
    sheen: 1.0,
    sheenColor: new THREE.Color('#d8e84d'),
    sheenRoughness: 0.45,
    clearcoat: 0.08,
    clearcoatRoughness: 0.4,
    envMapIntensity: 0.9,
  })

  return { material, uniforms }
}

export function useFeltMaterial(overrides?: Partial<FeltMaterialUniforms>) {
  return useMemo(() => createFeltMaterial(overrides), [])
}
