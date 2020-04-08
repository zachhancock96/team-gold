import React from 'react';
import { Routing } from 'meiosis-routing/state';
import { Login } from '../login';
import { School } from '../school';
import { Game } from '../game';
import { Calendar } from '../calendar';
import { Navbar } from '../navbar';
import { Loading } from 'shared/view';

const componentMap = {
  //Login,
  School,
  Game,
  Calendar
};

export const Root = ({ state, actions }) => {
  const routing = Routing(state.route);
  const Component = componentMap[routing.localSegment.id];

  const navbar = Component.showNavbar ? <Navbar state={state} actions={actions} routing={routing}/> : null;
  const component = <Component state={state} actions={actions} routing={routing} />
  const loading = state.loading ? <Loading /> : null;

  if (!navbar) {
    return (
      <React.Fragment>
        {loading}
        <div style={{
          height: '100vh'
        }}>
          <Component state={state} actions={actions} routing={routing} />
        </div>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      {loading}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh'        
      }}>
        <div>{navbar}</div>,
        <div style={{ flex: 1 }}>{component}</div>
      </div>
    </React.Fragment>
  );      
}
// export const Root = ({ state, actions }) => {
//   //const routing = Routing(state.route);
//   //const Component = componentMap[routing.localSegment.id];

//   // return (
//   //   <div style={{height: '100vh'}}>
//   //     <Login state={state} actions={actions} routing={routing} />
//   //   </div>
//   // );

//   return (
//     <Navbar state={state} actions={actions} />
//   )
// }