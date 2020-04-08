import React from 'react';

export const Login = ({ state, actions, routing }) => {
  const form = state.login.form;

  return (
    <div className="login">
      <img src="./img/team_gold_logo.png" alt="Team logo" className="image-logo" />
      <h2>Welcome to Team-Gold Soccer Scheduling System</h2>
      <br />
      <div className="container" id="container">
        {/* <div className="responsive"> */}
        <div className="form-container sign-in-container">
          <form
            id="form_login"
            onsubmit={
              e => {
                e.preventDefault();
                actions.login({ email: form.email, password: form.password });
              }
            }>
            <h1>Sign in</h1>

            <input
              type="email"
              id="email"
              placeholder="Email"
              value={form.email}
              oninput={e => actions.updateLoginForm('email', e.target.value)}
            />

            <input
              type="password"
              id="password"
              placeholder="Password"
              type="password"
              value={form.password}
              oninput={e => actions.updateLoginForm('password', e.target.value)} />

            <a href="#">Forgot your password?</a>

            <input
              className="submit"
              type="submit"
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
  )
}
Login.showNavbar = false;