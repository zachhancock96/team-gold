import m from 'mithril';
import { Loading } from 'shared/view';


// export const Login = ({ state, actions, routing }) => {
//   const form = state.login.form;


//   return [
//       <div>
//         <form onsubmit={
//             e => {
//                 e.preventDefault();
//                 actions.login({ email: form.email, password: form.password });
//               }
//             }>
//               <label>
//                 Email:
//                     <input
//                   type="email"
//                   value={form.email}
//                  onChange={e => actions.updateLoginForm('email', e.target.value)} />
//               </label>

//               <label>
//                 Password:
//                     <input
//                   type="password"
//                   value={form.password}
//                 onChange={e => actions.updateLoginForm('password', e.target.value)} />
//               </label>
//           <input
//           type="submit"
//           value="Login" />
//       </form>
//     </div>
//   ];
// }

export function Login() {
  return (
	<div class="login">
		<img src="./img/team_gold_logo.png" alt="Team logo" class="image-logo"/>
		<h2>Welcome to Team-Gold Soccer Scheduling System</h2>
		<br />
		<div class="container" id="container">
			{/* <div class="responsive"> */}
				<div class="form-container sign-in-container">
					<form id="form_login" action="">
					<h1>Sign in</h1>
					<input type="email" id="email" placeholder="Email"/>
					<input type="password" id="password" placeholder="Password"/>
					<a href="#">Forgot your password?</a>
					<button>Login</button> <br />
					<label class="remember">Remember me
					<input type="checkbox" />
					<span class="checkmark"></span>
					</label>
					</form>
				</div>
			{/* </div> */}
			{/* <div class="overlay">
				<div class="overlay-panel overlay-right list-container">
					<div class="responsive">
					<a id="calendar_overlay" href="#" target="_blank" />
					<img src="../img/list-view-games.png" alt="List Style Calender goes here" class="list-image" />
					<div class="list-overlay">
						<p class="list-text">Full Schedule</p>
					</div>
					</div>
				</div>
			</div> */}
		</div>
		<footer class="footer">
			<p>
				Created with <i class="fa fa-heart"></i> by
				<a> Team-Gold for CSCI 4060</a> 
			</p>
		</footer>
	</div>
  )
}

Login.showNavBar = false;