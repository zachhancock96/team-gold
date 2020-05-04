import React from 'react';
import { api } from 'shared';
import { Route, navigateTo } from '../routes';
import { View } from './view';

export class Login extends React.Component {

    state = {
      login: {
        email: '',
        password: '',
        canSubmit: false
      },
      signup: {
        name: '',
        email: '',
        password: '',
        role: '',
        schoolId: -1,
        canSubmit: false,
        confirmPassword: ''
      },
      schools: [],
      shouldAnimateEnd: false,
      user: null,
      roles: [
        {
          label: 'Select your Role',
          value: ''
        },
        {
          label: 'School Admin',
          value: 'school_admin'
        },
        {
          label: 'School Coach',
          value: 'school_rep'
        }
      ]
    }

    componentDidMount() {
      api.getSchools()
        .then(schools => {
          schools = schools
            .filter(s => s.isLhsaa)
            .map(s => ({ label: s.name, value: s.id }));

          schools.unshift({ label: 'Select your School', value: -1 });

          this.setState({ schools });
        })
    }

    handleSignupEmailChange = email => {
      const s = this.state.signup;
      this.setState({signup: {...s, email}}, () => { this.postSignupFormUpdate(); });      
    }

    handleSignupNameChange = name => {
      const s = this.state.signup;
      this.setState({signup: {...s, name}}, () => { this.postSignupFormUpdate(); });      
    }

    handleSignupPasswordChange = password => {
      const s = this.state.signup;
      this.setState({signup: {...s, password}}, () => { this.postSignupFormUpdate(); });
    }

    handleSignupConfirmPasswordChange = confirmPassword => {
      const s = this.state.signup;
      this.setState({signup: {...s, confirmPassword}}, () => { this.postSignupFormUpdate(); });
    }

    handleSignupSchoolChange = schoolId => {
      const s = this.state.signup;
      this.setState({signup: {...s, schoolId}}, () => { this.postSignupFormUpdate(); });
    }

    handleSignupRoleChange = role => {
      const s = this.state.signup;
      this.setState({signup: {...s, role}}, () => { this.postSignupFormUpdate(); });
    }

    postSignupFormUpdate = () => {
      const s = this.state.signup;
      const canSubmit = !!(s.name && s.email && s.password 
        && s.password === s.confirmPassword
        && s.schoolId !== -1 && s.role !== '');
      if (canSubmit != s.canSubmit) {
        this.setState({ signup: { ...s, canSubmit } });
      }
    }

    handleLoginEmailChange = email => {
      const s = this.state.login;
      this.setState({ login: { ...s, email }}, () => { this.postLoginFormUpdate(); });
    }

    handleLoginPasswordChange = password => {
      const s = this.state.login;
      this.setState({ login: { ...s, password } }, () => { this.postLoginFormUpdate(); });
    }

    postLoginFormUpdate = () => {
      const s = this.state.login;
      const canSubmit = !!(s.email && s.password);
      if (canSubmit !== s.canSubmit) {
        this.setState({ login: { ...s, canSubmit } });
      }
    }

    handleLogin = () => {
      const { email, password, canSubmit } = this.state.login;
      if (!canSubmit) return;

      const { actions } = this.props;
      
      actions.showLoading('Login');
      api.login({ email, password })
        .then(() => {
          return api.getMe();
        })
        .then(user => {
          this.setState({shouldAnimateEnd: true, user });
          actions.showMessage(`Welcome, ${user.name}`, 'long');
        })
        .catch(err => {
          actions.showError(err.message || err);
        })
        .finally(() => {
          actions.hideLoading('Login');
        });
    }

    handleSignup = () => {
      const s = this.state.signup;
      if (!s.canSubmit) return;

      const { actions } = this.props;
      const o = { name: s.name, email: s.email, password: s.password, role: s.role, schoolId: s.schoolId } = s;

      actions.showLoading('Signup');
      api.signup(o)
        .then(() => {
          actions.showSuccess(`Success! You should recieve a confirmation from us shortly, 
            and then you will be able to login.`);

          this.setState({ signup: {
            name: '',
            email: '',
            password: '',
            role: '',
            schoolId: -1,
            canSubmit: false,
            confirmPassword: ''
          } });
        })
        .catch(err => {
          actions.showError(err.message || err);
        })
        .finally(() => {
          actions.hideLoading('Signup');
        })
    }

    handleEndAnimationEnded = () => {
      const { user } = this.state;
      const { actions } = this.props;
      actions.updateState([
        navigateTo(Route.School()),
        { user }
      ]);
    }

    render() {
      const { login, signup, schools, roles, shouldAnimateEnd } = this.state;
      return (
        <View
          onLoginEmailChange={this.handleLoginEmailChange}
          onLoginPasswordChange={this.handleLoginPasswordChange}
          onLoginSubmit={this.handleLogin}
          onSignupRoleChange={this.handleSignupRoleChange}
          onSignupSchoolChange={this.handleSignupSchoolChange}
          onSignupEmailChange={this.handleSignupEmailChange}
          onSignupPasswordChange={this.handleSignupPasswordChange}
          onSignupConfirmPasswordChange={this.handleSignupConfirmPasswordChange}
          onSignupNameChange={this.handleSignupNameChange}
          onSignupSubmit={this.handleSignup}
          onEndAnimationEnded={this.handleEndAnimationEnded}
          shouldAnimateEnd={shouldAnimateEnd}
          login={login}
          signup={signup}
          schools={schools}
          roles={roles} />
      );
    }
}

Login.showNavbar = false;