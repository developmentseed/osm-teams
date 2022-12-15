import React from 'react'

export default function SvgSquare({ color, size = 20 }) {
  return (
    <svg width={size} height={size}>
      <rect width={size} height={size} style={{ fill: color }} />
    </svg>
  )
}
