import React from 'react';
import $ from 'jquery';

export class Loading extends React.Component {
  state = {
    loading: false
  }

  componentDidMount() {
    $('head').append(`<style>${css}</style>`);
  }

  show = () => {
    if (this.state.loading) return;

    this.setState({ loading: true }, () => {
      setTimeout(() => {
        this.setState({loading: false});
      }, 800);
    });
  }

  componentDidUpdate() {
    const state = this.props.state;

    const shouldShow = state.loading && Object.keys(state.loading)
      .reduce((shouldShow, k) => {
        if (shouldShow) return true;
        if (state.loading[k]) return true;
    
        return false;
      }, false);

    if (shouldShow) {
      this.show();
    }
  }
  
  render() {

    const { loading } = this.state;

    return loading
      ? (
        <div className='loading modal'>
          <div className="box">
            <div className="shadow"></div>
            <div className="gravity">
              <div className="ball"></div>
            </div>
          </div>
        </div>
      )
      : null;
  }
}

const css = `.loading.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  z-index: 99999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading .box {
  margin: 0 auto;
  width: 80px;
  height: 180px;
  position: relative;
}

.loading .shadow {
  position: absolute;
  width: 100%;
  height: 10px;
  background-color: grey;
  bottom: 0;
  border-radius: 100%;
  transform: scaleX(.8);
  opacity: .6;
  animation: shadowScale 1s linear infinite;
}

.loading .gravity {
  width: 80px;
  height: 80px;
  animation: bounce 1s cubic-bezier(0.68, 0.35, 0.29, 0.54) infinite;
}

.loading .ball {
  width: 80px;
  height: 80px;
  background-image: url('img/ball.svg');  
  background-size: cover;
  animation: roll .6s linear infinite;
}

@keyframes roll {
  0% {}
  100% { transform: rotate(360deg) }
}
@keyframes bounce {
  0% {}
  50% { transform: translateY(100px) }
  100% {}
}
@keyframes shadowScale {
  0% {}
  50% { transform: scaleX(1); opacity: .8;}
  100% {}
}`;