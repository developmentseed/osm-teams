import React from 'react'

export default function Section({ children, 'data-cy': dataCy }) {
  return <section data-cy={dataCy}>{children}</section>
}
