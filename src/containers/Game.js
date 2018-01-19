import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { fetchOneGame, fetchPlayers } from '../actions/games/fetch'
import { connect as subscribeToWebsocket } from '../actions/websocket'
import JoinGameDialog from '../components/games/JoinGameDialog'

const playerShape = PropTypes.shape({
  userId: PropTypes.string.isRequired,
  name: PropTypes.string
})

class Game extends PureComponent {
  static propTypes = {
    fetchOneGame: PropTypes.func.isRequired,
    fetchPlayers: PropTypes.func.isRequired,
    subscribeToWebsocket: PropTypes.func.isRequired,
    game: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      board: PropTypes.arrayOf(PropTypes.string),
      userId: PropTypes.string.isRequired,
      playerOneId: PropTypes.string,
      playerOne: playerShape,
      playerTwoId: PropTypes.string,
      playerTwo: playerShape,
      draw: PropTypes.bool,
      updatedAt: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
    }),
    turn: PropTypes.number.isRequired,
    started: PropTypes.bool,
    isPlayer: playerShape,
    isPlayer: PropTypes.bool,
    isJoinable: PropTypes.bool,
    hasTurn: PropTypes.bool
  }

  componentWillMount() {
    const { game, fetchOneGame, subscribeToWebsocket } = this.props
    const { gameId } = this.props.match.params

    if (!game) { fetchOneGame(gameId) }
    subscribeToWebsocket()
  }

  componentWillReceiveProps(nextProps) {
    const { game } = nextProps

    if (game && !game.playerOne) {
      this.props.fetchPlayers(game)
    }
  }

  render() {
    const { game } = this.props

    if (!game) return null

    const title = [game.playerOne, game.playerTwo]
      .filter(n => !!n)
      .map(p => (p.name || null))
      .filter(n => !!n)
      .join(' vs ')

    return (
      <div className="Game">
        <h1>Game!</h1>
        <p>{title}</p>

        <h1>YOUR GAME HERE! :)</h1>

        <h2>Debug Props</h2>
        <pre>{JSON.stringify(this.props, true, 2)}</pre>

        <JoinGameDialog gameId={game._id} />
      </div>
    )
  }
}

const mapStateToProps = ({ currentUser, games }, { match }) => {
  const game = games.filter((g) => (g._id === match.params.gameId))[0]
  const currentUserId = currentUser && currentUser._id
  const squaresFilled = (game && game.board.filter(s => !null).length) || 0
  const started = squaresFilled > 0
  const isPlayer = game && currentUserId &&
    (game.playerOneId === currentUserId || game.playerTwoId === currentUserId)
  const turn = squaresFilled % 2
  const hasTurn = isPlayer &&
    (turn === 0 && game.playerOneId === currentUserId) ||
    (turn === 1 && game.playerTwoId === currentUserId)
  const isJoinable = game && !isPlayer &&
    (!game.playerOneId || !game.playerTwoId)

  return {
    isPlayer,
    game,
    isPlayer,
    hasTurn,
    isJoinable
  }
}

export default connect(mapStateToProps, {
  subscribeToWebsocket,
  fetchOneGame,
  fetchPlayers
})(Game)
