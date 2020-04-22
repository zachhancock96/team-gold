import { Calendar as MyCalendar } from 'shared/view';


export const Calendar = ({state, actions, routing}) => {
  return (
    <div>
      <h2>Calendar</h2>
      <div>
        Hello world
      </div>
      
      <div>
        <MyCalendar events={state.calendar.events}/>
      </div>
    </div>
  )
}

Calendar.showNavbar = true;