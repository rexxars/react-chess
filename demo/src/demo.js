const React = require('react')
const ReactDOM = require('react-dom')
const Chess = require('../../src/react-chess')

class Demo extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {}
  }

  render() {
    return (
      <div className="demo">
        <Chess />
      </div>
    )
  }
}

if (typeof window !== 'undefined') {
  ReactDOM.render(<Demo />, document.getElementById('main'))
}

module.exports = Demo
