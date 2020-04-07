import m from 'mithril';
import meiosis from "meiosis-setup/mergerino"
import stream from "meiosis-setup/simple-stream"
import merge from "mergerino"
import { createApp } from './app';
import { router } from './router';
import { viewport } from './viewport';
import { TracerComponent } from './tracer';

const withTracer = false;

createApp()
  .then(app => {
    console.log('should be running');
    const { states, actions, update } = meiosis({app, stream, merge });

    const root = document.getElementById('root');

    const ViewWithTracer_ = ViewWithTracer(states);

    states.map(state => {
      const View = withTracer? ViewWithTracer_: ViewWithoutTracer;
      m.render(root, View({app, state, actions}));

      //`state.route` to browser address bar
      router.locationBarSync(state.route);
    });

    //browser address bar to `state.route`
    router.start({ navigateTo: actions.navigateTo });

    //updates `device` state whenever viewport width jumps threshold
    viewport.watchDeviceChange({ update, states });
  });

const ViewWithTracer = states => ({app, state, actions}) => {
  return [
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between'
    }}>
      <div style={{flex: 1}}>
        { app.view({state, actions}) }
      </div>
      <div>
        <TracerComponent states={states} /> 
      </div>
    </div>
  ];
}

const ViewWithoutTracer = ({app, state, actions}) => app.view({state, actions});