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
//   timeout(500)
//     .then(() => {
//       return [
//         createSchoolData(1, 'Compton High School', 'Abhaya Uprety'),
//         createSchoolData(2, 'Dakota Sisters High School', 'Pacho Herera'),
//         createSchoolData(3, 'Mason Dixon High School', 'John Baptiste'),
//         createSchoolData(4, 'Monroe High School', 'Ed Sullivan')
//       ];
//     });
// }

export const getSchools = (() => {
  const schools = [
    { id: 1, name: 'Compton High School' },
    { id: 2, name: 'Dakota Sisters High School' },
    { id: 3, name: 'Mason Dixon High School' },
    { id: 4, name: 'Monroe High School' }
  ];

  return () => {
    return timeout(500)
      .then(() => {
        return schools
      });
  }
})();

export const getMe = () => {
  return timeout(500)
    .then(() => {
      const user = getUser();
      return user;
    });
}

export const login = ({ name, email }) => {
  const token = Math.random() + '';
  const user = {
    id: 1,
    name: name,
    email: email,
    role: 'assignor'
  };

  setToken(token);
  setUser(user);

  return timeout(500);
}

export const logout = () => {
  clearToken();
  clearUser();

  return timeout(500);
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