/* eslint-disable react/display-name, react/prop-types */
const React = require('react')

const tileSize = 100
const pieceSize = 45
const wantedPieceSize = 85
const scaleFactor = wantedPieceSize / pieceSize

const size = tileSize * scaleFactor
const offset = 6.75

module.exports = Piece => props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    x={props.x * tileSize + offset}
    y={props.y * tileSize + offset}
    viewBox="0 0 100 100"
  >
    <Piece />
  </svg>
)
