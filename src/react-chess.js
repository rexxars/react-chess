const React = require('react')
const PropTypes = require('prop-types')
const Draggable = require('react-draggable')
const defaultLineup = require('./defaultLineup')
const pieceComponents = require('./pieces')
const decode = require('./decode')

const getDefaultLineup = () => defaultLineup.slice()
const noop = () => {
  /* intentional noop */
}

const yLabelStyles = {position: 'absolute', top: '5%', left: '5%'}
const xLabelStyles = {position: 'absolute', bottom: '5%', right: '5%'}
const square = 100 / 8
const squareSize = `${square}%`

class Chess extends React.Component {
  constructor(...args) {
    super(...args)

    this.els = {}
    this.state = {scaleFactor: 1}
    this.setBoardRef = el => (this.els.board = el)
    this.onDragStart = this.onDragStart.bind(this)
    this.onDragStop = this.onDragStop.bind(this)
  }

  getSquareColor(x, y) {
    const {lightSquareColor, darkSquareColor} = this.props
    const odd = x % 2

    if (y % 2) {
      return odd ? lightSquareColor : darkSquareColor
    }

    return odd ? darkSquareColor : lightSquareColor
  }

  componentDidMount() {
    const boardSize = this.els.board.clientWidth
    const tileSize = boardSize / 8
    this.setState({boardSize, tileSize})
    // @todo handle resize events
  }

  coordsToPosition(coords) {
    const x = Math.round(coords.x / this.state.tileSize)
    const y = Math.round(coords.y / this.state.tileSize)
    return {
      x,
      y,
      pos: `${String.fromCharCode(decode.charCodeOffset + x)}${7 - y + 1}`
    }
  }

  onDragStart(evt, drag) {
    evt.stopPropagation()
    evt.preventDefault()
    const node = drag.node
    const dragFrom = this.coordsToPosition({x: node.offsetLeft, y: node.offsetTop})
    this.setState({dragFrom})
  }

  onDragStop(evt, drag) {
    const {dragFrom} = this.state
    const node = drag.node
    const dragTo = this.coordsToPosition({x: node.offsetLeft + drag.x, y: node.offsetTop + drag.y})
    const piece = this.findPieceAtPosition(dragFrom.pos)

    this.props.onMovePiece(piece, dragFrom.pos, dragTo.pos)
    this.setState({dragFrom: null})
  }

  findPieceAtPosition(pos) {
    for (let i = 0; i < this.props.pieces.length; i++) {
      const piece = this.props.pieces[i]
      if (piece.indexOf(pos) === 2) {
        return {notation: piece, name: piece.slice(0, 1), index: i}
      }
    }

    return null
  }

  renderLabelText(x, y) {
    const isLeftColumn = x === 0
    const isBottomRow = y === 7

    if (!this.props.drawLabels || (!isLeftColumn && !isBottomRow)) {
      return null
    }

    if (isLeftColumn && isBottomRow) {
      return [
        <span key="blx" style={xLabelStyles}>
          a
        </span>,
        <span key="bly" style={yLabelStyles}>
          1
        </span>
      ]
    }

    const label = isLeftColumn ? 8 - y : String.fromCharCode(decode.charCodeOffset + x)
    return <span style={isLeftColumn ? yLabelStyles : xLabelStyles}>{label}</span>
  }

  render() {
    const tiles = []
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const fill = this.getSquareColor(x, y)
        const styles = {
          width: squareSize,
          paddingBottom: squareSize,
          background: fill,
          float: 'left',
          position: 'relative'
        }

        tiles.push(
          <div key={`rect-${x}-${y}`} style={styles}>
            {this.renderLabelText(x, y)}
          </div>
        )
      }
    }

    const pieces = this.props.pieces.map((decl, i) => {
      const {x, y, piece} = decode.fromPieceDecl(decl)
      const Piece = pieceComponents[piece]
      return (
        <Draggable
          bounds="parent"
          onStart={this.onDragStart}
          onStop={this.onDragStop}
          key={`${piece}-${x}-${y}`}>
          <Piece x={x} y={y} />
        </Draggable>
      )
    })

    const children = tiles.concat(pieces)
    const boardStyles = {position: 'relative', overflow: 'hidden', height: this.state.boardSize}

    return (
      <div ref={this.setBoardRef} style={boardStyles}>
        {children}
      </div>
    )
  }
}

Chess.propTypes = {
  drawLabels: PropTypes.bool,
  lightSquareColor: PropTypes.string,
  darkSquareColor: PropTypes.string,
  onMovePiece: PropTypes.func,
  pieces: PropTypes.arrayOf(PropTypes.string)
}

Chess.defaultProps = {
  drawLabels: true,
  onMovePiece: noop,
  lightSquareColor: '#f0d9b5',
  darkSquareColor: '#b58863',
  pieces: getDefaultLineup()
}

Chess.getDefaultLineup = getDefaultLineup

module.exports = Chess
