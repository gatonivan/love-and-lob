uniform vec3 uGrabPoint;
uniform vec3 uDragDelta;
uniform float uGrabStrength;
uniform float uGrabRadius;
uniform float uTime;

varying float vDeformation;

void main() {
  vec3 pos = position;

  // Subtle idle breathing animation
  float breathe = sin(uTime * 1.5) * 0.005;
  pos += normal * breathe;

  // Distance from this vertex to the grab point (local space)
  float dist = distance(pos, uGrabPoint);

  // Gaussian falloff: 1.0 at grab point, falls off with uGrabRadius
  float falloff = exp(-dist * dist / (2.0 * uGrabRadius * uGrabRadius));
  float influence = falloff * uGrabStrength;

  // Displace vertex along the drag direction, scaled by influence
  vec3 displacement = uDragDelta * influence;
  pos += displacement;

  // Pass deformation magnitude to fragment shader for visual feedback
  vDeformation = length(displacement);

  // Recompute normal using neighbor sampling technique
  // Sample two neighboring points along tangent and bitangent
  float eps = 0.001;
  vec3 tangent = normalize(cross(normal, vec3(0.0, 1.0, 0.0)));
  if (length(cross(normal, vec3(0.0, 1.0, 0.0))) < 0.001) {
    tangent = normalize(cross(normal, vec3(1.0, 0.0, 0.0)));
  }
  vec3 bitangent = normalize(cross(normal, tangent));

  // Neighbor positions with same deformation applied
  vec3 neighbor1 = position + tangent * eps;
  float dist1 = distance(neighbor1, uGrabPoint);
  float falloff1 = exp(-dist1 * dist1 / (2.0 * uGrabRadius * uGrabRadius));
  neighbor1 += uDragDelta * falloff1 * uGrabStrength;

  vec3 neighbor2 = position + bitangent * eps;
  float dist2 = distance(neighbor2, uGrabPoint);
  float falloff2 = exp(-dist2 * dist2 / (2.0 * uGrabRadius * uGrabRadius));
  neighbor2 += uDragDelta * falloff2 * uGrabStrength;

  // Corrected normal from cross product of displaced edges
  vec3 displacedNormal = normalize(cross(neighbor1 - pos, neighbor2 - pos));

  // Blend between original and displaced normal based on deformation
  csm_Normal = mix(normal, displacedNormal, uGrabStrength);
  csm_Position = pos;
}
