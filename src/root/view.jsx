import { Container } from 'react-bootstrap';
import React from 'react';
import { Routing } from 'meiosis-routing/state';
import { Login } from '../login';
import { School } from '../school';
import { Game } from '../game';
import { Calendar } from '../calendar';
import { Navbar } from '../navbar';
import { Loading } from '../loading';
import { Toast } from '../toast';

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

  return (
    <React.Fragment>
      <Loading state={state} />
      <Toast state={state} />
      <div className="flex-col-100">
        {navbar}
        <Container className="flex-1">
          {component}
        </Container>
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