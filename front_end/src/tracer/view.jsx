import meiosisTracer from "meiosis-tracer"
import m from 'mithril';

/*
  attrs: {
    states: Stream<any>; required
    rows: number; defaults to 50
    cols: number; defaults to 50
  }
*/
export const TracerComponent = ({ attrs }) => {
  let tracerSetup = 0;

  const oncreate = (vnode) => {
    if (++tracerSetup > 1) {
      console.warn('Tracer setup should only be called once');
    }

    let { states, rows, cols } = attrs;
    rows = rows || 50;
    cols = cols || 50;

    meiosisTracer({
      selector: '#tracer',
      streams: [{ stream: states, label: "states" }],
      rows, cols
    })    
  };

  return {
    view: () => {
      return <div oncreate={oncreate} id="tracer"></div>
    }
  };
};