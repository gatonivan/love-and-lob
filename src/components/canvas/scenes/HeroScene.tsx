import { TennisBall } from '../models/TennisBall'

export function HeroScene() {
  return (
    <group position={[0, 0, 0]}>
      <TennisBall position={[0, 0, 0]} />
    </group>
  )
}
