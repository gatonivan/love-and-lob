import { EffectComposer, Vignette, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useSceneStore } from '../../../stores/sceneStore'
import { Vector2 } from 'three'

export function PostProcessing() {
  const ballDeformAmount = useSceneStore((s) => s.ballDeformAmount)

  return (
    <EffectComposer>
      <Vignette
        offset={0.3}
        darkness={0.6}
        blendFunction={BlendFunction.NORMAL}
      />
      <Bloom
        intensity={0.15}
        luminanceThreshold={0.8}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <ChromaticAberration
        offset={new Vector2(
          ballDeformAmount * 0.003,
          ballDeformAmount * 0.003
        )}
        blendFunction={BlendFunction.NORMAL}
        radialModulation={false}
        modulationOffset={0}
      />
    </EffectComposer>
  )
}
