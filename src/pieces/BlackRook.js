const React = require('react')
const piecePositionHoc = require('../piecePositionHoc')

function BlackRook(props) {
  return (
    <g
      fill={0}
      fillRule="evenodd"
      stroke="#000"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M9 39h27v-3H9v3zM12.5 32l1.5-2.5h17l1.5 2.5h-20zM12 36v-4h21v4H12z"
        strokeLinecap="butt"
      />
      <path d="M14 29.5v-13h17v13H14z" strokeLinecap="butt" strokeLinejoin="miter" />
      <path d="M14 16.5L11 14h23l-3 2.5H14zM11 14V9h4v2h5V9h5v2h5V9h4v5H11z" strokeLinecap="butt" />
      <path
        d="M12 35.5h21M13 31.5h19M14 29.5h17M14 16.5h17M11 14h23"
        fill="none"
        stroke="#fff"
        strokeWidth={1}
        strokeLinejoin="miter"
      />
    </g>
  )
}

module.exports = piecePositionHoc(BlackRook)
