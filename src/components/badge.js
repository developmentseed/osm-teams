import React from 'react'
import { Tag } from '@chakra-ui/react'
const hexToRgb = (hex) =>
  hex
    .replace(
      /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
      (m, r, g, b) => '#' + r + r + g + g + b + b
    )
    .substring(1)
    .match(/.{2}/g)
    .map((x) => parseInt(x, 16))
    .join()

export default function Badge({ color, dot, children }) {
  return (
    <Tag
      color={color}
      bg={`rgba(${hexToRgb(color)}, 0.125)`}
      size='sm'
      borderRadius={'full'}
      boxShadow={`0 0 0 1px rgba(${hexToRgb(color)}, 0.25)`}
      mr={2}
      overflow='hidden'
      _before={
        dot && {
          content: '""',
          bgColor: color,
          height: 2,
          width: 2,
          borderRadius: 'full',
          boxShadow: '0 0 0 1px var(--chakra-colors-brand-50)',
          mr: 2,
        }
      }
    >
      {children}
    </Tag>
  )
}
