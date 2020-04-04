import m from 'mithril';
import { Loading } from 'shared/view';

export const Login = ({ state, actions, routing }) => {
  const form = state.login.form;
  
  return [
    <div>
      <form onsubmit={
        e => {
          e.preventDefault();
          actions.login({ name: form.name, email: form.email });
        }
      }>
        <label>
          Name:
          <input
            typel="name"
            value={form.name}
            oninput={e => actions.updateLoginForm('name', e.target.value)} />
        </label>
        <label>
          Email:
              <input
            type="email"
            value={form.email}
            oninput={e => actions.updateLoginForm('email', e.target.value)} />
        </label>
        <input
          type="submit"
          value="Login" />
      </form>
    </div>
  ];
}

Login.showNavBar = false;