import React from 'react';
import ReactDOM from 'react-dom';

import meiosis from "meiosis-setup/mergerino"
import stream from "meiosis-setup/simple-stream"
import merge from "mergerino"
import { createApp } from './app';
import { router } from './router';
import { viewport } from './viewport';
import { toast } from './toast';

const withTracer = false;

createApp()
  .then(app => {
    console.log('should be running');
    const { states, actions, update } = meiosis({app, stream, merge });

    const root = document.getElementById('root');

    const ViewWithTracer_ = ViewWithTracer(states);

    states.map(state => {
      const View = withTracer? ViewWithTracer_: ViewWithoutTracer;
      ReactDOM.render(View({app, state, actions}), root);

      //`state.route` to browser address bar
      router.locationBarSync(state.route);
    });

    //browser address bar to `state.route`
    router.start({ navigateTo: actions.navigateTo });

    //updates `device` state whenever viewport width jumps threshold
    viewport.watchDeviceChange({ update, states, actions });

    //removes `toasts` from array whenever any toast expires
    toast.watchToastChange({ update, states, actions });
  });

const ViewWithTracer = states => ({app, state, actions}) => {
  return <div>View with Tracer (dont worry about this)</div>;
}

const ViewWithoutTracer = ({app, state, actions}) => app.view({state, actions});