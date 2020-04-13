import $ from 'jquery';
import moment, {API_DATE_FORMAT} from './moment';

const BASE_URL = "http://18.219.186.34/api";

const API_URLS = {
  GET_USERS: () => `${BASE_URL}/users`,
  GET_ME: () => `${BASE_URL}/users/me`,
  
  GET_TEAMS: () => `${BASE_URL}/teams`,
  GET_SCHOOLS: () => `${BASE_URL}/schools`,

  GET_GAMES: () => `${BASE_URL}/games`,
  GET_MY_GAMES: () => `${BASE_URL}/games/me`,
  GET_GAME: (id) => `${BASE_URL}/games/${id}`,
  GET_GAME_ACTIONS: (id) => `${BASE_URL}/games/${id}/actions`,
  GET_GAME_HISTORY: (id) => `${BASE_URL}/games/${id}/history`,
  ADD_GAME: () => `${BASE_URL}/games`,
  REJECT_GAME: gameId => `${BASE_URL}/games/${gameId}/reject`,
  ACCEPT_GAME: gameId => `${BASE_URL}/games/${gameId}/accept`,
  EDIT_GAME: gameId => `${BASE_URL}/games/${gameId}/accept`,
  
  LOGIN: () => `${BASE_URL}/login`
};

export function getUsers() {
  return authGet(API_URLS.GET_USERS())
    .then(response => response.users);
}

export function getGame(id) {
  return authGet(API_URLS.GET_GAME(id))
    .then(o => o.game);
}

export function getMe() {
  return authGet(API_URLS.GET_ME())
    .then(response => response.user);
}

export function getTeams() {
  return authGet(API_URLS.GET_TEAMS())
    .then(response => response.teams);
}

//TODO: change this later
export function getMyTeams() {
  return getTeams();
}

export function getSchools() {
  return authGet(API_URLS.GET_SCHOOLS())
    .then(response => response.schools);
}

export function getGames() {
  return authGet(API_URLS.GET_MY_GAMES())
    .then(response => response.games);
}

/*
  GET  /games/id
  GET /games/id/actions
  GET /games/id/history
*/
export const loadGameAndActionAndHistory = async (gameId) => {
  gameId = parseInt(gameId);

  const game = await authGet(API_URLS.GET_GAME(gameId))
    .then(o => o.game);
  const actions = await authGet(API_URLS.GET_GAME_ACTIONS(gameId))
    .then(o => o.actions);
  const history = await authGet(API_URLS.GET_GAME_HISTORY(gameId))
    .then(o => o.history);
  
  return {
    game,
    actions,
    history
  }
}

export function addGame(game) {
  const o = {
    homeTeamId: game.homeTeamId,
    awayTeamId: game.awayTeamId,
    start: moment(game.start).format(API_DATE_FORMAT),
    location: game.location
  };

  return authPost(API_URLS.ADD_GAME(), o)
    .then(response => response.gameId);
}

export function rejectGame(gameId) {
  return authPost(API_URLS.REJECT_GAME(gameId), {});
}

export function acceptGame(gameId) {
  return authPost(API_URLS.ACCEPT_GAME(gameId), {});
}

export function editGame(gameId, edit) {
  const o = {
    start: moment(edit.start).format(API_DATE_FORMAT),
    location: edit.location
  };

  return authPost(API_URLS.EDIT_GAME(gameId), o);
}

export function login(credentials) {
  const o = {
    email: credentials.email,
    password: credentials.password
  }
  return httpPost(API_URLS.LOGIN(o), o)
    .then(response => {
      const sessionId = response.sessionId;
      setToken(sessionId);
    })
}

const [httpGet, httpPost] = (function() {

  function httpGet(url, queryObject) {
    queryObject = queryObject || {};
  
    return new Promise(function (resolve, reject) {
      $.ajax({
        url,
  
        //request data type
        contentType: "application/json",
  
        //server response data type
        dataType: "json",
  
        method: "GET",
  
        data: queryObject,
  
        error: function(jqXhr, textStatus, errorThrown) {
          const status = jqXhr.status;
          if (status === 401) {
            reject('Requires login');
            return;
          } else {
            reject(errorThrown);
          }
        },
  
        success: function(data, textStatus, jqXhr) {
          if (data.ok) {
            resolve(data);
          } else {
            reject(data.reason);
          }
        }
      });
    });
  }

  function httpPost(url, body) {
    body = body || {};
    body = JSON.stringify(body);
  
    return new Promise(function (resolve, reject) {
      $.ajax({
        url,
  
        //request data type
        contentType: "application/json",
  
        //server response data type
        dataType: "json",
  
        method: "POST",
  
        data: body,
  
        processData: false,
  
        error: function (jqXhr, textStatus, errorThrown) {
          const status = jqXhr.status;
          if (status === 401) {
            reject('Requires login');
            return;
          } else {
            reject(errorThrown);
          }
        },
  
        success: function (data, textStatus, jqXhr) {
          if (data.ok) {
            resolve(data);
          } else {
            reject(data.reason);
          }
        }
      });
    });
  }

  return [httpGet, httpPost];
})();

const [authGet, authPost] = (function() {

  function authGet(url, queryObject) {
    queryObject = queryObject || {};
    const sessionId = getToken();
    console.log(`calling authGet with sessionid header: ${sessionId}`)
  
    return new Promise(function (resolve, reject) {
      $.ajax({
        url,
  
        //request data type
        contentType: "application/json",
  
        //server response data type
        dataType: "json",

        headers: {
          sessionid: sessionId
        },
  
        method: "GET",
  
        data: queryObject,
  
        error: function(jqXhr, textStatus, errorThrown) {
          const status = jqXhr.status;
          if (status === 401) {
            reject('Requires login');
            return;
          } else {
            reject(errorThrown);
          }
        },
  
        success: function(data, textStatus, jqXhr) {
          if (data.ok) {
            resolve(data);
          } else {
            reject(data.reason);
          }
        }
      });
    });
  }

  function authPost(url, body) {
    body = body || {};
    body = JSON.stringify(body);
    const sessionId = getToken();
  
    return new Promise(function (resolve, reject) {
      $.ajax({
        url,
  
        //request data type
        contentType: "application/json",
  
        //server response data type
        dataType: "json",

        headers: {
          sessionid: sessionId
        },
  
        method: "POST",
  
        data: body,
  
        processData: false,
  
        error: function(jqXhr, textStatus, errorThrown) {
          const status = jqXhr.status;
          if (status === 401) {
            reject('Requires login');
            return;
          } else {
            reject(errorThrown);
          }
        },
  
        success: function(data, textStatus, jqXhr) {
          if (data.ok) {
            resolve(data);
          } else {
            reject(data.reason);
          }
        }
      });
    });
  }

  return [authGet, authPost];
})();

/*
  no route yet, just delte token
*/
export const logout = () => {
  clearToken();
}

const getToken = () => window.localStorage.getItem('sessionid') || 2;
const setToken = token => window.localStorage.setItem('sessionid', token);
const clearToken = () => window.localStorage.removeItem('sessionid');