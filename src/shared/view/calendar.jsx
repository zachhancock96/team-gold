// import React from 'react';
// import { stream } from "meiosis-setup/simple-stream"

// import { Calendar as FullCalendar } from '@fullcalendar/core';
// import dayGridPlugin from '@fullcalendar/daygrid';

// /*
//   We are wrapping a bootstrap library
//   into a "Mithril Component".

//   Mithril Component is any function that returns
//   an object that has view function, and that view function
//   in-turn should return a Virtual dom object i.e. jsx element.

//   e.g. const myMithrilComponent = function() {

//     return {
//       view: function() {
//         return <div>Hello world</div>
//       }
//     }
//   }
// */
// export const Calendar = () => {
//   let calendar;
//   let eventStream = stream([]);
  
//   eventStream.map(events => {
//     if (calendar) {
      
//       const oldEvents = calendar.getEventSources();
//       if (oldEvents.length) {
//         oldEvents[0].remove();
//       }
  
//       calendar.addEventSource(events);
//     }
//   });

//   return {
//     view: vnode => {
//       eventStream(vnode.attrs.events || []);
//       return <div style={{width: '100%', height: '100%'}}></div>
//     },    

//     oncreate: vnode => {
//       const calendarRoot = vnode.dom;

//       calendar = new FullCalendar(calendarRoot, {
//         plugins: [ dayGridPlugin ],
//         height: 'parent',
//         width: 'parent',
//         events: eventStream()
//       });
  
//       calendar.render();
//     },

//     onremove: vnode => {
//       if (calendar) {
//         calendar.destroy();
//       }
//     }
//   }
// }