const React = require('react')
const PropTypes = require('prop-types')
const Draggable = require('react-draggable')
const resizeAware = require('react-resize-aware')
const defaultLineup = require('./defaultLineup')
const pieceComponents = require('./pieces')
const decode = require('./decode')

const ResizeAware = resizeAware.default || resizeAware
const getDefaultLineup = () => defaultLineup.slice()
const noop = () => {
  /* intentional noop */
}

const yLabelStyles = {fontSize: 'calc(7px + .5vw)', position: 'absolute', top: '5%', left: '5%'}
const xLabelStyles = {fontSize: 'calc(7px + .5vw)', position: 'absolute', bottom: '5%', right: '5%'}
const square = 100 / 8
const squareSize = `${square}%`

class Chess extends React.Component {
  constructor(...args) {
    super(...args)

    this.els = {}
    this.state = {}
    this.setBoardRef = el => (this.els.board = el)
    this.handleDragStart = this.handleDragStart.bind(this)
    this.handleDragStop = this.handleDragStop.bind(this)
    this.handleDrag = this.handleDrag.bind(this)
    this.handleResize = this.handleResize.bind(this)
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
  }

  handleResize(size) {
    const tileSize = size.width / 8
    this.setState({boardSize: size.width, tileSize})
  }

  coordsToPosition(coords) {
    const x = Math.round(coords.x / this.state.tileSize)
    const y = Math.round(coords.y / this.state.tileSize)
    return {
      x,
      y,
      pos: `${String.fromCharCode(decode.charCodeOffset + x)}${8 - y}`
    }
  }

  handleDrag(evt, drag) {
    if (!this.props.highlightTarget) {
      return
    }

    const {targetTile} = this.state
    const {x, y} = this.coordsToPosition({
      x: drag.node.offsetLeft + drag.x,
      y: drag.node.offsetTop + drag.y
    })

    if (!targetTile || targetTile.x !== x || targetTile.y !== y) {
      this.setState({targetTile: {x, y}})
    }
  }

  handleDragStart(evt, drag) {
    const node = drag.node
    const dragFrom = this.coordsToPosition({x: node.offsetLeft, y: node.offsetTop})
    this.setState({dragFrom, draggingPiece: this.findPieceAtPosition(dragFrom.pos), reset: null})
  }

  handleDragStop(evt, drag) {
    const node = drag.node
    const {dragFrom, draggingPiece} = this.state
    const dragTo = this.coordsToPosition({x: node.offsetLeft + drag.x, y: node.offsetTop + drag.y})

    this.setState({dragFrom: null, targetTile: null, draggingPiece: null})

    // Snap back to original position if drag failed
    if (dragFrom.pos === dragTo.pos) {
      this.setState({reset: draggingPiece.notation})
      return
    }

    // "next tick", prevents setState errors in draggable internals (we might remove the piece from the DOM)
    setTimeout(() => {
      this.props.onMovePiece(draggingPiece, dragFrom.pos, dragTo.pos)
    }, 10)
  }

  findPieceAtPosition(pos) {
    for (let i = 0; i < this.props.pieces.length; i++) {
      const piece = this.props.pieces[i]
      if (piece.indexOf(pos) === 2) {
        return {notation: piece, name: piece.slice(0, 1), index: i, position: pos}
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
    const {targetTile, boardSize} = this.state

    const tiles = []
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const isTarget = targetTile && targetTile.x === x && targetTile.y === y
        const fill = this.getSquareColor(x, y)
        const styles = {
          width: squareSize,
          paddingBottom: squareSize,
          background: fill,
          float: 'left',
          position: 'relative',
          boxShadow: isTarget ? 'inset 0px 0px 0px 0.4vmin yellow' : undefined
        }

        tiles.push(
          <div key={`rect-${x}-${y}`} style={styles}>
            {this.renderLabelText(x, y)}
          </div>
        )
      }
    }

    const pieces = this.props.pieces.map((decl, i) => {
      const reset = this.state.reset === decl
      const {x, y, piece} = decode.fromPieceDecl(decl)
      const Piece = pieceComponents[piece]
      return (
        <Draggable
          bounds="parent"
          onStart={this.handleDragStart}
          onDrag={this.handleDrag}
          onStop={this.handleDragStop}
          key={`${piece}-${x}-${y}`}>
          <Piece reset={reset} x={x} y={y} />
        </Draggable>
      )
    })

    const children = tiles.concat(pieces)
    const boardStyles = {position: 'relative', overflow: 'hidden', height: boardSize}

    return (
      <ResizeAware
        ref={this.setBoardRef}
        onlyEvent
        onResize={this.handleResize}
        style={boardStyles}>
        {children}
      </ResizeAware>
    )
  }
}

Chess.propTypes = {
  highlightTarget: PropTypes.bool,
  drawLabels: PropTypes.bool,
  lightSquareColor: PropTypes.string,
  darkSquareColor: PropTypes.string,
  onMovePiece: PropTypes.func,
  pieces: PropTypes.arrayOf(PropTypes.string)
}

Chess.defaultProps = {
  highlightTarget: true,
  drawLabels: true,
  onMovePiece: noop,
  lightSquareColor: '#f0d9b5',
  darkSquareColor: '#b58863',
  pieces: getDefaultLineup()
}

Chess.getDefaultLineup = getDefaultLineup

module.exports = Chess
