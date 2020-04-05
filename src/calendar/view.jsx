import m from 'mithril';
import { Calendar as MyCalendar } from 'shared/view';

export const Calendar = ({state, actions, routing}) => {
  return (
    <div>
      <h2>Calendar</h2>
      <div>
        <MyCalendar events={state.calendar.events}/>
      </div>
    </div>
  )
}

Calendar.showNavbar = true;