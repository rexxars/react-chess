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

const square = 100 / 8
const squareSize = `${square}%`

const squareStyles = {
  width: squareSize,
  paddingBottom: squareSize,
  float: 'left',
  position: 'relative',
  pointerEvents: 'none'
}

const labelStyles = {fontSize: 'calc(7px + .5vw)', position: 'absolute', userSelect: 'none'}
const yLabelStyles = Object.assign({top: '5%', left: '5%'}, labelStyles)
const xLabelStyles = Object.assign({bottom: '5%', right: '5%'}, labelStyles)

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
    this.handleBoardClick = this.handleBoardClick.bind(this)
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
    evt.preventDefault()

    if (!this.props.allowMoves) {
      return false
    }

    const node = drag.node
    const dragFrom = this.coordsToPosition({x: node.offsetLeft, y: node.offsetTop})
    const draggingPiece = this.findPieceAtPosition(dragFrom.pos)
    if (this.props.onDragStart(draggingPiece, dragFrom.pos) === false) {
      return false
    }

    this.setState({dragFrom, draggingPiece})
    return evt
  }

  handleDragStop(evt, drag) {
    const node = drag.node
    const {dragFrom, draggingPiece} = this.state
    const dragTo = this.coordsToPosition({x: node.offsetLeft + drag.x, y: node.offsetTop + drag.y})

    this.setState({dragFrom: null, targetTile: null, draggingPiece: null})

    if (dragFrom.pos !== dragTo.pos) {
      this.props.onMovePiece(draggingPiece, dragFrom.pos, dragTo.pos)
      return false
    }

    return true
  }

  handleBoardClick(event) {
    const clickedTile = this.coordsToPosition({
      x: event.clientX - this.els.board.container.offsetLeft - this.state.tileSize / 2, 
      y: event.clientY - this.els.board.container.offsetTop - this.state.tileSize / 2
    })

    if (!this.state.clickedTile && this.findPieceAtPosition(clickedTile.pos)) {
      this.setState({
        targetTile: {x: clickedTile.x, y: clickedTile.y, pos: clickedTile.pos},
        clickedTile: {x: clickedTile.x, y: clickedTile.y, pos: clickedTile.pos}
      })
    } else if (this.state.clickedTile) {
      const movingPiece = this.findPieceAtPosition(this.state.clickedTile.pos);
      this.props.onMovePiece(movingPiece, this.state.clickedTile.pos, clickedTile.pos)
      this.setState({
        targetTile: {x: null, y: null, pos: null},
        clickedTile: null
      })
    }
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
    const {targetTile, draggingPiece, boardSize} = this.state

    const tiles = []
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const isTarget = targetTile && targetTile.x === x && targetTile.y === y
        const background = this.getSquareColor(x, y)
        const boxShadow = isTarget ? 'inset 0px 0px 0px 0.4vmin yellow' : undefined
        const styles = Object.assign({background, boxShadow}, squareStyles)

        tiles.push(
          <div key={`rect-${x}-${y}`} style={styles}>
            {this.renderLabelText(x, y)}
          </div>
        )
      }
    }

    const pieces = this.props.pieces.map((decl, i) => {
      const isMoving = draggingPiece && i === draggingPiece.index
      const {x, y, piece} = decode.fromPieceDecl(decl)
      const Piece = pieceComponents[piece]
      return (
        <Draggable
          bounds="parent"
          position={{x: 0, y: 0}}
          onStart={this.handleDragStart}
          onDrag={this.handleDrag}
          onStop={this.handleDragStop}
          key={`${piece}-${x}-${y}`}>
          <Piece isMoving={isMoving} x={x} y={y} />
        </Draggable>
      )
    })

    const children = tiles.concat(pieces)
    const boardStyles = {position: 'relative', overflow: 'hidden', width: '100%', height: boardSize}

    return (
      <ResizeAware
        ref={this.setBoardRef}
        onlyEvent
        onResize={this.handleResize}
        onClick={this.handleBoardClick}
        style={boardStyles}>
        {children}
      </ResizeAware>
    )
  }
}

Chess.propTypes = {
  allowMoves: PropTypes.bool,
  highlightTarget: PropTypes.bool,
  drawLabels: PropTypes.bool,
  lightSquareColor: PropTypes.string,
  darkSquareColor: PropTypes.string,
  onMovePiece: PropTypes.func,
  onDragStart: PropTypes.func,
  pieces: PropTypes.arrayOf(PropTypes.string)
}

Chess.defaultProps = {
  allowMoves: true,
  highlightTarget: true,
  drawLabels: true,
  onMovePiece: noop,
  onDragStart: noop,
  lightSquareColor: '#f0d9b5',
  darkSquareColor: '#b58863',
  pieces: getDefaultLineup()
}

Chess.getDefaultLineup = getDefaultLineup

module.exports = Chess
