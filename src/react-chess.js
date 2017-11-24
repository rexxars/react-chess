const React = require('react')
const PropTypes = require('prop-types')
const defaultLineup = require('./defaultLineup')
const pieceComponents = require('./pieces')
const decode = require('./decode')

class Chess extends React.Component {
  getSquareColor(x, y) {
    const {lightSquareColor, darkSquareColor} = this.props
    const odd = x % 2

    if (y % 2) {
      return odd ? lightSquareColor : darkSquareColor
    }

    return odd ? darkSquareColor : lightSquareColor
  }

  render() {
    const tiles = []
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const fill = this.getSquareColor(x, y)
        tiles.push(
          <rect
            key={`rect-${x}-${y}`}
            y={y * 100}
            x={x * 100}
            fill={fill}
            height={100}
            width={100}
          />
        )
      }
    }

    const pieces = this.props.pieces.map(decl => {
      const {x, y, piece} = decode.fromPieceDecl(decl)
      const Piece = pieceComponents[piece]
      return <Piece key={`${x}-${y}`} x={x} y={y} />
    })

    const children = tiles.concat(pieces)

    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
        {children}
      </svg>
    )
  }
}

Chess.propTypes = {
  lightSquareColor: PropTypes.string,
  darkSquareColor: PropTypes.string,
  pieces: PropTypes.arrayOf(PropTypes.string)
}

Chess.defaultProps = {
  lightSquareColor: '#f0d9b5',
  darkSquareColor: '#b58863',
  pieces: defaultLineup
}

module.exports = Chess
