import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { fetchOneGame, fetchPlayers } from '../actions/games/fetch'
import patchGame from '../actions/games/patch'
import { connect as subscribeToWebsocket } from '../actions/websocket'
import JoinGameDialog from '../components/games/JoinGameDialog'
import Square from '../components/games/Square'

const playerShape = PropTypes.shape({
  userId: PropTypes.string.isRequired,
  name: PropTypes.string
})

const squareStyles = { display: 'flex', flexFlow: 'row wrap', width: 305, height: 305, margin: '100px auto'}

class Game extends PureComponent {
  static propTypes = {
    fetchOneGame: PropTypes.func.isRequired,
    fetchPlayers: PropTypes.func.isRequired,
    subscribeToWebsocket: PropTypes.func.isRequired,
    patchGame: PropTypes.func.isRequired,
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

  claimSquare = index => () => {
    this.props.patchGame(this.props.game._id, { claim: index })
  }

  renderSquares = () => {
    const { game } = this.props
    return game.board.map((s,i) => (
      <Square
        onClick={this.claimSquare(i)}
        value={s}
        key={i}
      />
    ))
  }

  render() {
    console.log(this.props)
    const { game, hasTurn } = this.props

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

        <div style={{ ...squareStyles, cursor: hasTurn ? 'pointer' : 'inherit' }}>
          {this.renderSquares()}
        </div>

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
  const squaresFilled = (game && game.board.filter(s => !!s).length) || 0
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
    isJoinable,
    squaresFilled
  }
}

export default connect(mapStateToProps, {
  subscribeToWebsocket,
  fetchOneGame,
  fetchPlayers,
  patchGame
})(Game)
