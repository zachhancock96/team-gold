import m from 'mithril';

// const createSchoolData = function(id, schoolName, schoolAdminName) {
//     return {
//       id,
//       name: schoolName,
//       schoolReps: [
//         {
//           id: 1,
//           name: 'Hari Bansha Acharya'
//         }, {
//           id: 2,
//           name: 'Madan Krishna Shrestha'
//         }
//       ],
//       teams: [
//         {
//           id: 1,
//           name: 'Varsity Boys (VB)',
//           teamKind: 'vb'
//         }, 
//         {
//           id: 2,
//           name: 'Junior Varsity Boys (VB)',
//           teamKind: 'jvb'
//         }, 
//         {
//           id: 3,
//           name: 'Varsity Girls (VG)',
//           teamKind: 'vg'
//         }, 
//       ],
//       schoolAdmin: {
//         id: 3,
//         name: schoolAdminName
//       },
//       assignor: {
//         id: 4,
//         name: 'John Quincy Adams'
//       }
//   };
// };

// export const getSchools = () => {
//   timeout(100)
//     .then(() => {
//       return [
//         createSchoolData(1, 'Compton High School', 'Abhaya Uprety'),
//         createSchoolData(2, 'Dakota Sisters High School', 'Pacho Herera'),
//         createSchoolData(3, 'Mason Dixon High School', 'John Baptiste'),
//         createSchoolData(4, 'Monroe High School', 'Ed Sullivan')
//       ];
//     });
// }



/*
  query: {schoolAdmin: number}  | {schoolRep: number} | {assignor: number} | nothing
*/
export const getSchools = query => {
  return timeout(100)
    .then(() => {
      return [
        { id: 1, name: 'Compton High School' },
        { id: 2, name: 'Dakota Sisters High School' },
        { id: 3, name: 'Mason Dixon High School' },
        { id: 4, name: 'Monroe High School' }
      ];
  });
}

/*
  query: {schoolIds: []} | nothing
*/
export const getGames = (() => {
  const mock = [
    'pending_home',
    'pending_away',
    'pending_assignor',
    'accepted',
    'rejected'
  ].map((status, index) => ({
      id: index + 1,
      homeTeam: {
        id: 1,
        teamKind: 'JVB',
        school: {
          id: 1,
          name: 'Compton High School'
        }
      },
      awayTeam: {
        id: 1,
        teamKind: 'JVB',
        school: {
          id: 2,
          name: 'Dakota Sisters High School'
        }
      },
      start: '2019-01-02T07:00:00-06:00',
      location: 'Denver, Colorado',
      status
    }));
  
  return query => {
    return timeout(100)
      .then(() => {
        return mock;
      })
  }
})();

/*
  GET  /games/id
  GET /games/id/actions
  GET /games/id/history
*/
export const loadGameAndActionAndHistory = async (gameId) => {
  gameId = parseInt(gameId);
  const games = await getGames();
  const game = games.find(g => g.id === gameId);

  return {
    game,
    actions: ['accept', 'reject', 'edit'],
    history: [
      {
        start: '2019-01-02T07:00:00-06:00',
        location: 'Denver, Colorado',
        status: 'pending_away',
        timestamp: '2019-01-02T07:00:00-06:00',
        updateType: 'create',
        updater: {
          id: 1,
          name: 'Abhaya Uprety'
        },
        updaterType: 'home'
      },
      {
        start: '2019-01-02T07:00:00-06:00',
        location: 'Springs, Colorado',
        status: 'pending_away',
        timestamp: '2019-01-02T07:00:00-06:00',
        updateType: 'update',
        updater: {
          id: 1,
          name: 'Abhaya Uprety'
        },
        updaterType: 'away'
      },
      {
        start: '2019-01-02T07:00:00-06:00',
        location: 'Springs, Colorado',
        status: 'pending_away',
        timestamp: '2019-01-02T07:00:00-06:00',
        updateType: 'accept',
        updater: {
          id: 1,
          name: 'Abhaya Uprety'
        },
        updaterType: 'assignor'
      },
    ]
  };  
}

/*
  POST /games/:id/accept
  body: {nothing  }
*/
export const acceptGame = async gameId => {
  await timeout(100);    
}

/*
  POST /games/:id/reject
  body: { nothing }
*/
export const rejectGame = async gameId => {
  await timeout(100);
}

/*
  POST /games
  body: { 
    homeTeamId: number;
    awayTeamId: number;
    start: string;
    location: string;
  }
*/
export const addGame = async ({homeTeamId, awayTeamId, start, location}) => {
  await timeout(100);
}

/*
  GET /teams
  query: {schoolAdmin: number}  | {schoolRep: number} | {assignor: number} | nothing
*/
export const getTeams = async query => {
  await timeout(100);

  return [
    {
      id: 1,
      teamKind: 'JVB',
      name: 'Compton High School JVB',
      school: {
        id: 1,
        name: 'Compton High School'
      }
    },
    {
      id: 2,
      teamKind: 'JVB',
      name: 'Dakota Sisters High School JVB',
      school: {
        id: 1,
        name: 'Dakota Sisters High School'
      }
    },
  ]
}

//const BASE_URL = "http://18.219.186.34/api/";
const BASE_URL = "http://localhost:4000/api/";

const API_URLS = {
  login: () => BASE_URL + 'login',
  me: () => BASE_URL + 'users/me',
};

const req = options => {

  //adding auth header if possible
  const headers = getToken()
    ? { sessionid: getToken() }
    : {};
  options.headers = options.headers? {...options.headers, ...headers}: headers;

  //make request
  return m.request(options)
    .then(res => {
      if (!res.ok) throw new Error(res.reason);
      return res;
    })
}

/*
  POST /login
  body {
    email: string;
    password: string;
  }
*/
export const login = async ({ email, password }) => {
  const { sessionId } = await req({
    method: "POST",
    url: API_URLS.login(),
    body: { email, password }
  });
  setToken(sessionId);
}

/*
  GET /users/me
*/
export const getMe = async () => {
  const { user } = await req({
    method: "GET",
    url: API_URLS.me(),
  });
  return user;
}


/*
  no route yet, just delte token
*/
export const logout = () => {
  clearToken();
  clearUser();

  return timeout(100);
}

function timeout(n) {
  return new Promise(resolve => {
    setTimeout(resolve, n);
  });
}

const getUser = () => {
  const u = window.localStorage.getItem('user');
  return u? JSON.parse(u): null;
};
const setUser = user => window.localStorage.setItem('user', JSON.stringify(user));
const clearUser = () => window.localStorage.removeItem('user');

const getToken = () => window.localStorage.getItem('authtoken');
const setToken = token => window.localStorage.setItem('authtoken', token);
const clearToken = () => window.localStorage.removeItem('authtoken');