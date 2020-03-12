import $ from 'jquery';
import moment, {API_DATE_FORMAT} from './moment';

//const BASE_URL = "http://18.219.186.34/api";
const BASE_URL = "http://localhost:4000/api"

const API_URLS = {
  GET_USERS: () => `${BASE_URL}/users`,
  GET_TEAMS: () => `${BASE_URL}/teams`,
  GET_SCHOOLS: () => `${BASE_URL}/schools`,
  GET_GAMES: () => `${BASE_URL}/games`,
  GET_GAMES_WITH_PRIVILEGES: (userId, privileges) => `${BASE_URL}/users/${userId}/privileges/${privileges}/games`,
  ADD_GAME: () => `${BASE_URL}/games`,
  APPROVE_GAME: gameId => `${BASE_URL}/games/${gameId}/approve`,
  REJECT_GAME: gameId => `${BASE_URL}/games/${gameId}/reject`,
  ACCEPT_GAME: gameId => `${BASE_URL}/games/${gameId}/accept`,
  EDIT_GAME: gameId => `${BASE_URL}/games/${gameId}/accept`,
  LOGIN: () => `${BASE_URL}/login`
};

export function getUsers() {
  return authGet(API_URLS.GET_USERS())
    .then(response => response.users);
}

export function getTeams() {
  return authGet(API_URLS.GET_TEAMS())
    .then(response => response.teams);
}

export function getSchools() {
  return autGet(API_URLS.GET_SCHOOLS())
    .then(response => response.schools);
}

export function getGames() {
  console.log('doing get games');
  return authGet(API_URLS.GET_GAMES())
    .then(response => response.games);
}

export function getGamesWithPrivileges(privileges) {
  //NOTE: hacky userId
  const userId = parseInt(localStorage.getItem("sessionId"));
  return authGet(API_URLS.GET_GAMES_WITH_PRIVILEGES(userId, privileges))
    .then(response => response.games);
}

export function getMe() {
  //NOTE: hacky userId
  const userId = parseInt(localStorage.getItem("sessionId"));
  return getUsers()
    .then(users => {
      return users.find(u => u.id === userId);
    });
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


export function approveGame(gameId) {
  return authPost(API_URLS.APPROVE_GAME(gameId), {});
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
      localStorage.setItem('sessionId', sessionId);
    })
}

/*
    @param url: string,
    @param queryObject: object (optional)
*/

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
    const sessionId = localStorage.getItem('sessionId');
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
            redirectToLogin();
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
    const sessionId = localStorage.getItem('sessionId');
  
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
            redirectToLogin();
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

export {
  httpGet,
  httpPost
};

function redirectToLogin() {
  console.log('redirecting');
  const protocol = window.location.protocol;
  if (protocol === 'file:') {
    //e.g. file:///C:/Users/kenichi/Desktop/team-gold/front_end/html/game_view.html"
    let href = window.location.href

    for(let i = href.length - 1; i >= 0; i--) { 
      if (href.charAt(i) == '/') { 
        let loginHref = href.substring(0 , i) + '/index.html'
        window.location.href = loginHref;
        break;
      }
    }
  } else {
    //http or https
    //TODO:
    window.locatin.href = window.location.origin + '/index.html';
  }
}