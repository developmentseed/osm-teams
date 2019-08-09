import React from 'react'

export default function Section ({ children }) {
  return (
    <section>
      {children}
      <style jsx>
        {`
            margin: 2rem 0;
        `}
      </style>
    </section>
  )
}
