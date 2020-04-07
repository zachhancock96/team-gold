import { Route, redirect } from '../routes';
import { api } from 'shared';
import { gameToView, gameDetailToView } from './utils';

export const service = ({ state }) => {
  if (state.routeTransition.arrive.Game) {
    if (!state.user) {
      return redirect(Route.Login());
    }

    return {
      game: {
        title: '',
        games: [],
        approvedGames: [],
        pendingGames: [],
        rejectedGames: [],
        schoolIds: [],
        teams: [],
        myTeams: [],
        showFileUploadTab: false,
        showFilter: false,
        gameDetail: null,
        form: {
          addGame: {}
        },
      }
    };
  }
  if (state.routeTransition.leave.Game) {
    return { game: null };
  }
}

export const effect = async ({ state, update }) => {
  if (!state.user) { return; }

  const gameDetailArriveRoute = state.routeTransition.arrive.GameDetail;

  if (state.routeTransition.arrive.Game) {
    update({ loading: true });

    const user = state.user;

    const { title, myTeams, schoolIds, showFileUploadTab, showFilter } = await (async () => {
      if (user.role === 'school_admin' || user.role === 'school_rep') {
        const query = user.role === 'school_admin'
        ? { schoolAdmin: user.id }
        : { schoolRep: user.id };
        
        //TODO: assuming always 1 school for now
        const school = (await api.getSchools(query))[0];
        const myTeams = await api.getTeams(query);
  
        return {
          title: school.name + ' Games',
          schoolIds: [school.id],
          myTeams,
          showFilter: false,
          showFileUploadTab: false
        };
      } else {
        const query = { assignor: user.id };
        //TODO: assuming 1 or more schools for now
        //TODO: assuming the user is either school_adming or school_rep or assignor
        const schools = await api.getSchools(query);
        const schoolIds = schools.map(s => s.id);
        
        const myTeams = await api.getTeams(query);
                
        return {
          title: 'Games',
          schoolIds,
          myTeams,
          showFilter: true,
          showFileUploadTab: true
        };
      }
    })();

    const { approvedGames, rejectedGames, pendingGames, games } = await loadGames(schoolIds);

    const gameDetail = await (async () => {
      if (!gameDetailArriveRoute) return null;

      const id = gameDetailArriveRoute.params.id;
      
      //going to game and game detail page in one swoop
      return loadGameDetail(id);
    })();

    const teams = await api.getTeams();

    update({
      loading: false,
      game: {
        title,
        showFileUploadTab,
        showFilter,
        gameDetail,
        games,
        teams,
        myTeams,
        approvedGames,
        rejectedGames,
        pendingGames
      }
    });
  } else if (gameDetailArriveRoute) {
    //only game detail page change
    update({loading: true});

    const id = gameDetailArriveRoute.params.id;
    const gameDetail = await loadGameDetail(id);

    update({
      loading: false,
      game: { gameDetail }
    });    
  }
}

export async function loadGameDetail(id) {
  const detail_ = await api
    .loadGameAndActionAndHistory(id)
    .catch(error => {
      console.log(error);
      return null;
    });

  return detail_? gameDetailToView(detail_): null;
}

export async function loadGames(schoolIds) {
  const games_ = await api.getGames({schoolIds});
  const games = games_.map(gameToView);

  const approvedGames = games.filter(g => g.raw.status === 'accepted');
  const rejectedGames = games.filter(g => g.raw.status === 'rejected');
  const pendingGames = games.filter(g => ['pending_home','pending_assignor','pending_away'].indexOf(g.raw.status) >= 0);

  return { games, approvedGames, rejectedGames, pendingGames };
}