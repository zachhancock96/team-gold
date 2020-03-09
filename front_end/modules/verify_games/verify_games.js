import * as api from '../shared/api';
import { Calendar } from '@fullcalendar/core';
import ListView from '@fullcalendar/list';

document.addEventListener('DOMContentLoaded', calendarGames);
  
function calendarGames() {
  //fetch games
  api.getVerify().then(function(games) {
    var calendarEl = document.getElementById('calendar');
    var todayDate = new Date();

    var calendar = new Calendar(calendarEl, {
      plugins: [ ListView ],

      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'listWeek,dayGridMonth'
      },

      // customize the button names,
      // otherwise they'd all just say "list"
      views: {
        listWeek: { buttonText: 'list week' }
      },

      defaultView: 'listWeek',
      defaultDate: todayDate,
      navLinks: true, // can click day/week names to navigate views
      editable: true,
      eventLimit: true, // allow "more" link when too many events
      events: games
    });

    calendar.render();
  });
};