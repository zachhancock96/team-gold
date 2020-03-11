import * as api from '../shared/api_new';

// api.login({email: 'admin@test.net', password: 'password'})
//   .then(result => {
//     console.log(result);
//   })
//   .catch(error => {
//     console.log(error);
//   })

api.getUsers()
  .then(result => {
    console.log(result);
  })
