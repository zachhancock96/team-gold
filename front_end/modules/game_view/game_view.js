import * as api from '../shared/api';
import { Calendar } from '@fullcalendar/core';
import Interaction from '@fullcalendar/interaction';
import DayGrid from '@fullcalendar/daygrid';
import TimeGrid from '@fullcalendar/timegrid';
import ListView from '@fullcalendar/list';


//html is loaded
document.addEventListener('DOMContentLoaded', calendarGames);

function calendarGames() {
  //fetch games
  api.getGames().then(function(games){
    const gamesF = games.filter(mySchoolFunction);
    
    //render calendar
    var calendarEl = document.getElementById('calendar');
    var todayDate = new Date();
    var calendar = new Calendar(calendarEl, {
      //plugins: [ Interaction, DayGrid, TimeGrid, ListView ],
      plugins: [ 'interaction', 'dayGrid', 'timeGrid', 'list'],
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
      },
      selectable: true,
      select: function(arg) {
        var title = prompt('Event Title:');
        if (title) {
          calendar.addEvent({
            title: title,
            start: arg.start,
            end: arg.end,
            allDay: arg.allDay
          })
        }
        calendar.unselect()
      },
      defaultDate: todayDate,
      editable: true,
      navLinks: true, // can click day/week names to navigate views
      eventLimit: true, // allow "more" link when too many events
      events: gamesF
    });

      calendar.render();
  })
}

document.getElementById("myBtn").addEventListener("click", calendarGames);

function mySchoolFunction(gameN) {
  var input, filter, txtValue, i, a;

  input = document.getElementById('schoolName');
  filter = input.value.toUpperCase();
  a = gameN.title;
  txtValue = a.textContent || a.innerText;

  if(a.toUpperCase().indexOf(filter) > -1){
    return true;
  }
}