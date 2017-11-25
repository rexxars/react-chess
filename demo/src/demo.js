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
    const newPieces = this.state.pieces
      .map((curr, index) => {
        if (piece.index === index) {
          return `${piece.name}@${toSquare}`
        } else if (curr.indexOf(`@${toSquare}`) !== -1) {
          return false // To be removed from the board
        }
        return curr
      })
      .filter(Boolean)

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
