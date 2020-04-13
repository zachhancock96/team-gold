import React from 'react';
import { api } from 'shared';
import { Route, navigateTo } from '../routes';

export class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      canSubmit: false
    }
  }

  handleEmailChange = e => {
    this.setState({ email: e.target.value }, () => { this.postFormUpdate(); })
  }

  handlePasswordChange = e => {
    this.setState({ password: e.target.value }, () => { this.postFormUpdate(); })
  }

  postFormUpdate = () => {
    const canSubmit = !!(this.state.email && this.state.password);
    if (this.state.canSubmit !== canSubmit) {
      this.setState({ canSubmit });
    }
  }

  handleSubmit = e => {
    e.preventDefault();
    const { email, password, canSubmit } = this.state;
    if (!canSubmit) return;

    const { actions } = this.props;
    
    actions.showLoading('Login');
    api.login({ email, password })
      .then(() => {
        return api.getMe();
      })
      .then(user => {
        actions.updateState([
          navigateTo(Route.School()),
          { user }
        ]);
        actions.showMessage(`Welcome, ${user.name}`);
      })
      .catch(err => {
        actions.showError(err.message || err);
      })
      .finally(() => {
        actions.hideLoading('Login');
      });
  }

  render() {
    const { email, password, canSubmit } = this.state;

    return (
      <div className="login">
        <img src="./img/team_gold_logo.png" alt="Team logo" className="image-logo" />
        <h2>Welcome to Team-Gold Soccer Scheduling System</h2>
        <br />
        <div className="container" id="container">
          <div className="form-container sign-in-container">
            <form
              id="form_login"
              onSubmit={this.handleSubmit}>
              <h1>Sign in</h1>
  
              <input
                type="email"
                id="email"
                placeholder="Email"
                value={email}
                onChange={this.handleEmailChange}
              />
  
              <input
                type="password"
                id="password"
                placeholder="Password"
                value={password}
                onChange={this.handlePasswordChange} />
  
              <a href="#">Forgot your password?</a>
  
              <input
                className="submit"
                type="submit"
                disabled={!canSubmit}
                value="Login" /> <br />
  
              <label className="remember">Remember me
              <input type="checkbox" />
                <span className="checkmark"></span>
              </label>
            </form>
          </div>
          {/* </div> */}
          {/* <div className="overlay">
          <div className="overlay-panel overlay-right list-container">
            <div className="responsive">
            <a id="calendar_overlay" href="#" target="_blank" />
            <img src="../img/list-view-games.png" alt="List Style Calender goes here" className="list-image" />
            <div className="list-overlay">
              <p className="list-text">Full Schedule</p>
            </div>
            </div>
          </div>
        </div> */}
        </div>
        <footer className="footer">
          <p>
            Created with <i className="fa fa-heart"></i> by
          <a> Team-Gold for CSCI 4060</a>
          </p>
        </footer>
      </div>
    );
  }
}

Login.showNavbar = false;