uniform float uGrabStrength;
uniform float uMaxStretch;

varying float vDeformation;

void main() {
  // Subtle color shift as deformation increases — warm tint toward red
  float stretchFactor = clamp(vDeformation / max(uMaxStretch, 0.001), 0.0, 1.0);
  csm_DiffuseColor.rgb = mix(
    csm_DiffuseColor.rgb,
    vec3(1.0, 0.3, 0.2),
    stretchFactor * 0.2
  );

  // Slightly reduce roughness at deformation peaks for a "stretched rubber" look
  csm_Roughness = csm_Roughness - stretchFactor * 0.15;
}
