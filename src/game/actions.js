import { api } from 'shared';
import { loadGames, loadGameDetail } from './service';

export const Actions = update => {

  const updateGameForm = (formType, field, value) => {
    update({
      game: {
        form: {
          [formType]: {
            [field]: value
          }          
        }
      }
    });
  }

  const addGame = async state => {
    const { homeTeamId, awayTeamId, start, location } = state.form['addGame'];

    if (!homeTeamId) {
      alert('Pelase select home team');
      return;
    }
    if (!awayTeamId) {
      alert('Pelase select away team');
      return;
    }
    if (!start) {
      alert('Pelase select start');
      return;
    }
    if (!location) {
      alert('Pelase select location');
      return;
    }

    await refreshGamesAndGameDetail(() => api.addGame({
      homeTeamId,
      awayTeamId,
      start,
      location
    })
      .catch(err => {
        console.log(err);
        alert(err);
      }), state, update);
  }

  const startEditing = state => {
    const id = state.gameDetail.id;

    alert('editing game with id ' + id);
  };

  const acceptGame = async (state) => {
    const gameId = state.gameDetail.id;
    await refreshGamesAndGameDetail(() => api.acceptGame(gameId), state, update);
  };

  const rejectGame = async (state) => {
    const gameId = state.gameDetail.id;
    await refreshGamesAndGameDetail(() => api.rejectGame(gameId), state, update);
 };

  return {
    startEditing,
    acceptGame,
    rejectGame,
    addGame,
    updateGameForm
  }
}

async function refreshGamesAndGameDetail(fn, state, update) {
  update({loading: true});
  await fn();
  const gameDetail = state.gameDetail? (await loadGameDetail(state.gameDetail.id)): null;

  const { games, approvedGames, rejectedGames, pendingGames } = await loadGames(state.schoolIds);

  update({
    loading: false,
    game: {
      gameDetail,
      games,
      approvedGames,
      rejectedGames,
      pendingGames
    }
  });
}