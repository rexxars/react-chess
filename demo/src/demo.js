const React = require('react')
const ReactDOM = require('react-dom')
const Chess = require('../../src/react-chess')

class Demo extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {pieces: Chess.getDefaultLineup()}
    this.handleMovePiece = this.handleMovePiece.bind(this)
  }

  handleMovePiece(piece, fromSquare, toSquare) {
    console.log('moved', piece, 'from ', fromSquare, 'to', toSquare)
    console.log('piece was at index', piece.index)

    const newPieces = this.state.pieces.slice()
    newPieces[piece.index] = `${piece.name}@${toSquare}`

    this.setState({pieces: newPieces})
  }

  render() {
    const {pieces} = this.state
    return (
      <div className="demo">
        <Chess pieces={pieces} onMovePiece={this.handleMovePiece} />
      </div>
    )
  }
}

if (typeof window !== 'undefined') {
  ReactDOM.render(<Demo />, document.getElementById('main'))
}

module.exports = Demo
