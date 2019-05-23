import React from 'react'

export default function Marker() {
  return (
    <div>
      <style jsx>{`
        .marker {
          width: 30px;
          height: 30px;
          border-radius: 50% 50% 50% 0;
          border-width: 3px;
          border-color: rgba(19, 119, 82, 1);
          border-style: solid;
          background-color: rgba(230,230,230,0.5);
          position: absolute;
          transform: translate(0, -15px) rotate(-45deg);
          left: 50%;
          top: 50%;
          margin: -20px 0 0 -20px;
          animation-name: bounce;
          animation-fill-mode: both;
          animation-duration: 1s;
        }
       .marker:after {
         content: '';
         width: 4px;
         height: 4px;
         margin: 4px 0 0 4px;
         background-color: rgba(250,250,250,0.7);
         border-width: 3px;
         border-color: rgba(19, 119, 82, 1);
         border-style: solid;
         position: absolute;
         border-radius: 50%;
       }
      `}</style>
      <div style={{
      }} className='marker' >
      </div>
    </div>
  )
}