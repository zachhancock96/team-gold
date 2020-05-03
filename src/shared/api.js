import $ from 'jquery';
import moment, {API_DATETIME_FORMAT} from './moment';

const BASE_URL = "http://18.219.186.34/api";
//const BASE_URL = "http://localhost:4000/api";

const API_URLS = {
  GET_USERS: () => `${BASE_URL}/users`,
  GET_ME: () => `${BASE_URL}/users/me`,
  
  GET_TEAMS: () => `${BASE_URL}/teams`,
  GET_MY_TEAMS: () => `${BASE_URL}/teams/me`,

  GET_SCHOOLS: () => `${BASE_URL}/schools`,
  POST_SCHOOL_NONLHSAA: `${BASE_URL}/schools/non-lhsaa`,

  GET_GAMES: () => `${BASE_URL}/games`,
  GET_MY_GAMES: () => `${BASE_URL}/games/me`,
  GET_GAME: (id) => `${BASE_URL}/games/${id}`,
  GET_GAME_ACTIONS: (id) => `${BASE_URL}/games/${id}/actions`,
  GET_GAME_HISTORY: (id) => `${BASE_URL}/games/${id}/history`,
  ADD_GAME: () => `${BASE_URL}/games`,
  REJECT_GAME: gameId => `${BASE_URL}/games/${gameId}/reject`,
  ACCEPT_GAME: gameId => `${BASE_URL}/games/${gameId}/accept`,
  EDIT_GAME: gameId => `${BASE_URL}/games/${gameId}/edit`,

  EXECUTE_SQL: `${BASE_URL}/sql-execute`,

  CREATE_CSV_EXPORT: `${BASE_URL}/csv-export`,
  GET_CSV_EXPORTS: `${BASE_URL}/csv-export`,
  GET_CSV_EXPORT: id => `${BASE_URL}/csv-export/${id}`,
  REMOVE_CSV_EXPORT: id => `${BASE_URL}/csv-export/${id}/remove`,
  EDIT_CSV_EXPORT_NOTE: id => `${BASE_URL}/csv-export/${id}/note`,
  
  LOGIN: () => `${BASE_URL}/login`,
  SIGNUP: `${BASE_URL}/signup`,

  ACCEPT_REP: (schoolId, userId) => `${BASE_URL}/schools/${schoolId}/school-reps/${userId}/accept`,
  REJECT_REP: (schoolId, userId) => `${BASE_URL}/schools/${schoolId}/school-reps/${userId}/reject`,
  REMOVE_REP: (schoolId, userId) => `${BASE_URL}/schools/${schoolId}/school-reps/${userId}/remove`,
  EDIT_REP: (schoolId, userId) => `${BASE_URL}/schools/${schoolId}/school-reps/${userId}/edit`,
  ACCEPT_SADMIN: (schoolId, userId) => `${BASE_URL}/schools/${schoolId}/school-admins/${userId}/accept`,
  REJECT_SADMIN: (schoolId, userId) => `${BASE_URL}/schools/${schoolId}/school-admins/${userId}/reject`,
  REMOVE_SADMIN: (schoolId, userId) => `${BASE_URL}/schools/${schoolId}/school-admins/${userId}/remove`,
  GET_SADMINS_OF_SCHOOL: schoolId => `${BASE_URL}/schools/${schoolId}/school-admins`,
  GET_REPS_OF_SCHOOL: schoolId => `${BASE_URL}/schools/${schoolId}/school-reps`
};

export function acceptSchoolRep(schoolId, repId) {
  return authPost(API_URLS.ACCEPT_REP(schoolId, repId))
}

export function rejectSchoolRep(schoolId, repId) {
  return authPost(API_URLS.REJECT_REP(schoolId, repId))
}

export function removeSchoolRep(schoolId, repId) {
  return authPost(API_URLS.REMOVE_REP(schoolId, repId))
}

export function editSchoolRep(schoolId, repId, teamIds) {
  return authPost(API_URLS.EDIT_REP(schoolId, repId), { teamIds })
}

export function acceptSchoolAdmin(schoolId, userId) {
  return authPost(API_URLS.ACCEPT_SADMIN(schoolId, userId))
}

export function rejectSchoolAdmin(schoolId, userId) {
  return authPost(API_URLS.REJECT_SADMIN(schoolId, userId))
}

export function removeSchoolAdmin(schoolId, userId) {
  return authPost(API_URLS.REMOVE_SADMIN(schoolId, userId));
}

export function getSchoolAdminsOfSchool(schoolId) {
  return authGet(API_URLS.GET_SADMINS_OF_SCHOOL(schoolId))
    .then(res => res.schoolAdmins);
}

export function getSchoolRepsOfSchool(schoolId) {
  return authGet(API_URLS.GET_REPS_OF_SCHOOL(schoolId))
    .then(res => res.schoolReps);
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

export function signup(o) {
  return httpPost(API_URLS.SIGNUP, o);
}

export function addNonLhsaaSchool(o) {
  return authPost(API_URLS.POST_SCHOOL_NONLHSAA, o)
    .then(response => response.schoolId);
}

export function createArbiterExport({ gameIds }) {
  return authPost(API_URLS.CREATE_CSV_EXPORT, { gameIds })
    .then(response => response.exportId);
}

export function createArbiterExportAndAccept({ gameIds }) {
  return authPost(API_URLS.CREATE_CSV_EXPORT, { gameIds, shouldApprovePendingGames: true })
    .then(response => response.exportId);
}

export function getArbiterExports() {
  return authGet(API_URLS.GET_CSV_EXPORTS)
    .then(response => response.exports);
}

export function getArbiterExport(id) {
  return authGet(API_URLS.GET_CSV_EXPORT(id))
    .then(response => response.export);
}

export function editArbiterExportNote(id, note) {
  return authPost(API_URLS.EDIT_CSV_EXPORT_NOTE(id), {note: note || null});
}

export function removeArbiterExport(id) {
  return authPost(API_URLS.REMOVE_CSV_EXPORT(id));
}

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

export function getMyTeams() {
  return authGet(API_URLS.GET_MY_TEAMS())
    .then(response => response.teams);
}

export function getSchools() {
  return httpGet(API_URLS.GET_SCHOOLS())
    .then(response => response.schools);
}

//TODO: have a backend api instead
export function getSchool(schoolId) {
  return getSchools()
    .then(schools => {
      return schools.find(s => s.id === schoolId) || null;
    });
}

export function executeSql(command) {
  return authPost(API_URLS.EXECUTE_SQL, { sql: command})
    .then(response => response.sqlResult);
}

export function getGames() {
  return authGet(API_URLS.GET_GAMES())
    .then(response => response.games);
}

export function getMyGames() {
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
    start: moment(game.start).format(API_DATETIME_FORMAT),
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
    start: moment(edit.start).format(API_DATETIME_FORMAT),
    location: edit.location
  };

  return authPost(API_URLS.EDIT_GAME(gameId), o);
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
  no route yet, just delete token
*/
export const logout = () => {
  clearToken();
}

const getToken = () => window.localStorage.getItem('sessionid');
const setToken = token => window.localStorage.setItem('sessionid', token);
const clearToken = () => window.localStorage.removeItem('sessionid');