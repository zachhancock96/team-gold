import m from 'mithril';
import { router } from '../router';
import { Route } from '../routes';
import { Routing } from 'meiosis-routing/state';

export const Navbar = ({ state, actions }) => {
  const routing = Routing(state.route);
  const className = id => routing.localSegment.id === id? 'navbar-links active': 'navbar-links';

  return (
    <div>
      <nav>
        <a
          href={router.toPath(Route.School())}
          class={className('School')}>
          School
        </a>
        <a
          href={router.toPath(Route.Game())}
          class={className('Game')}>
          Game
        </a>
        <a class='navbar-links'
          style={{ marginLeft: '20px' }}
          onclick={e => {
            e.preventDefault();
            actions.logout();
          }}>Logout</a>
      </nav>
    </div>
  );
};