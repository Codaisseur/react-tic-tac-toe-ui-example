import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import joinGame from '../../actions/games/join'

class JoinGameDialog extends PureComponent {
  static propTypes = {
    open: PropTypes.bool,
  }

  joinGame = () => {
    const { joinGame, game } = this.props
    joinGame(game)
  }

  render() {
    const { currentUser, open, isPlayer } = this.props

    if (isPlayer) return null

    const actions = [
      <Link to="/">
        <FlatButton
          label="No Thanks"
          primary={true} />
      </Link>,
      <RaisedButton
        label="Join Game"
        primary={true}
        keyboardFocused={true}
        onClick={this.joinGame}
      />,
    ]

    return (
      <div>
        <Dialog
          title="Join Game"
          actions={actions}
          modal={false}
          open={open}
          onRequestClose={this.handleClose}
        >
          Hey <strong>{currentUser.name || 'there'}!</strong> Would you like to join this game?
        </Dialog>
      </div>
    )
  }
}

const mapStateToProps = ({ currentUser, games }, { gameId }) => {
  const currentUserId = currentUser && currentUser._id
  const game = games.filter((g) => (g._id === gameId))[0]
  const isPlayer = game && currentUserId &&
    (game.playerOneId === currentUserId || game.playerTwoId === currentUserId)
  const isJoinable = game && !isPlayer &&
    (!game.playerOneId || !game.playerTwoId)

  return {
    game,
    currentUser,
    isPlayer,
    open: isJoinable
  }
}

export default connect(mapStateToProps, { joinGame })(JoinGameDialog)
