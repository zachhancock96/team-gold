import * as api from '../shared/api_new';
import $ from 'jquery';
// import { Calendar } from '@fullcalendar/core';
// import ListView from '@fullcalendar/list';

// document.addEventListener('DOMContentLoaded', calendarGames);
  
// function calendarGames() {
//   //fetch games
//   api.getVerify().then(function(games) {
//     var calendarEl = document.getElementById('calendar');
//     var todayDate = new Date();

//     var calendar = new Calendar(calendarEl, {
//       plugins: [ ListView ],

//       header: {
//         left: 'prev,next today',
//         center: 'title',
//         right: 'listWeek,dayGridMonth'
//       },

//       // customize the button names,
//       // otherwise they'd all just say "list"
//       views: {
//         listWeek: { buttonText: 'list week' }
//       },

//       defaultView: 'listWeek',
//       defaultDate: todayDate,
//       navLinks: true, // can click day/week names to navigate views
//       editable: true,
//       eventLimit: true, // allow "more" link when too many events
//       events: games
//     });

//     calendar.render();
//   });
// };

function startTheWholeThing() {
  api.getMe()
  .then(user => {
    
    const title = user.name + "|||" + user.role.toUpperCase() + "|||";
    $("#user_title").empty().append(title);

    const isApprover = user.role === 'assignor' || user.role === 'admin';
    const privilegesQuery = isApprover? 'approve_game': 'update_game';
    
    api.getGamesWithPrivileges(privilegesQuery)
      .then(games => {
        loadGameList(games, isApprover);
      })
  })
}

function loadGameList(games, isApprover) {
  games = games.map(g => ({
    id: g.id,
    title: g.homeTeam.name  + ' vs ' + g.awayTeam.name + ' @ ' + g.location,
    start: g.start,
    status: g.status
  }));

  let els = games.map(g => {

    const buttons = isApprover
      ? `<div>
          <button class="verify_game_btn" id="approve_${g.id}">Approve</button>
          <button class="verify_game_btn" id="reject_${g.id}">Reject</button>
        </div>`
      : `<div>
          <button class="verify_game_btn" id="accept_${g.id}">Accept</button>
          <button class="verify_game_btn" id="reject_${g.id}">Reject</button>
        </div>`;


    return `
    <li class="game-item">
      <div>${g.title}</div>
      <div>${g.start}</div>
      <div>${g.status}</div>
      <div>${isApprover? 'i am approver': 'i am either school rep or school admin'}</div>
      ${buttons}
    </li>
  ` 
  }).join('');

  els = `<li class="game-item game-title">
    <div>Game</div>
    <div>Start</div>
    <div>Status</div>
    <div>What am I? Descartes</div>
    <div>Action</div>
  </li> 
  ` + els;

  $('#game_list')
    .empty()
    .append(els);

  $('button').click(function(e) {
    const buttonId = $(this).attr('id');
    const action = buttonId.split('_')[0];
    const gameId = parseInt(buttonId.split('_')[1]);

    if (action === 'approve') {
      buttonActionPromiseWrapper(api.approveGame(gameId));
    } else if (action === 'reject') {
      buttonActionPromiseWrapper(api.rejectGame(gameId));
    } else if (action === 'accept') {
      buttonActionPromiseWrapper(api.acceptGame(gameId));
    } else {
      alert('something went wrong here, contact programmer');
    }
  });
}


function buttonActionPromiseWrapper(prom) {
  prom
    .then(() => {
      alert('success');
      startTheWholeThing();
    })
    .catch(error => {
      alert('error: ' + error.message || error);
    })
}


startTheWholeThing();