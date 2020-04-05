import m from 'mithril';
import { Routing } from 'meiosis-routing/state';
import { Login } from '../login';
import { School } from '../school';
import { Game } from '../game';
import { Calendar } from '../calendar';
import { Navbar } from '../navbar';
import { Loading } from 'shared/view';

const componentMap = {
  Login,
  School,
  Game,
  Calendar
};

export const Root = ({ state, actions }) => {
  const routing = Routing(state.route);
  const Component = componentMap[routing.localSegment.id];

  const navbar = Component.showNavbar ? Navbar({ state, actions }) : null;
  const component = Component({ state, actions, routing });
  const loading = state.loading ? Loading() : null;

  if (!navbar) {
    return [
      <div style={{
        height: '100vh'
      }}>
        {component}
      </div>,
      loading
    ];
  }

  return [
    loading,
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh'
    }}>
      {
        state.device === 'desktop'
        ? (
          [
            <div>{navbar}</div>,
            <div style={{ flex: 1 }}>{component}</div>
          ]
        ): (
          [
            <div style={{ flex: 1 }}>{component}</div>,
            <div>{navbar}</div>
          ]
        )
      }
    </div>
  ]
      
}