export const service = ({ state }) => {
  if (state.routeTransition.arrive.Calendar) {
    return {
      calendar: {
        events: []
      }
    };
  }
  if (state.routeTransition.leave.Calendar) {
    return { calendar: null };
  }
}

export const effect = (() => {

  let timeoutId = null;
  return ({state, update}) => {
    if (state.routeTransition.arrive.Calendar) {
      
      timeoutId = setInterval(() => {
        update({
          calendar: {
            events: getRandomEvents()
          }
        })
      }, 1000);
    }
  
    if (state.routeTransition.leave.Calendar) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }
})();

const getRandomEvents = () => {
  const events = [];
  for(let i = 0; i < 5; i++) {
    let r = randomBetween(10, 30);
    let title = 'event ' + r;
    let start = '2020-04-' + r;
    let end = start;

    events.push({ title, start, end });
  }
  return events;
}

const randomBetween = (a, b) => Math.round((Math.random() * a) + (b - a));

