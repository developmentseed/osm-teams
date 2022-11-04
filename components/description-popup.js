import React from 'react'
import Popup from 'reactjs-popup'

export default function descriptionPopup(description) {
  return (
    <Popup
      position='right top'
      on='click'
      closeOnDocumentClick
      trigger={
        <span className='infolink'>
          <style jsx>
            {`
              .infolink:after {
                content: '?';
                display: inline-block;
                font-family: sans-serif;
                font-weight: bold;
                text-align: center;
                font-size: 0.8em;
                line-height: 0.8em;
                border-radius: 50%;
                margin-left: 6px;
                padding: 0.13em 0.2em 0.09em 0.2em;
                color: inherit;
                border: 1px solid;
                text-decoration: none;
              }
            `}
          </style>
        </span>
      }
    >
      {description}
    </Popup>
  )
}
