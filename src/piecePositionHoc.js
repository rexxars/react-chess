/* eslint-disable react/display-name, react/prop-types */
const React = require('react')

module.exports = Piece => props => {
  const {onMouseDown, onMouseUp, onTouchEnd, onTouchStart, style, isMoving} = props
  const y = 7 - props.y

  const styles = Object.assign({}, style, {
    position: 'absolute',
    left: `${props.x * 12.5}%`,
    top: `${y * 12.5}%`,
    width: '12.5%',
    height: '12.5%',
    textAlign: 'center',
    zIndex: isMoving ? 1000 : undefined
  })

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onTouchEnd={onTouchEnd}
      onTouchStart={onTouchStart}
      style={styles}>
      <Piece size="85%" />
    </div>
  )
}
