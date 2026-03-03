import { EffectComposer, Bloom } from '@react-three/postprocessing'

export function PostProcessing() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.15}
        luminanceThreshold={0.8}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
    </EffectComposer>
  )
}
