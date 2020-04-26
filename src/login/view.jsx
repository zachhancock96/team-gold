import React from 'react';
import $ from 'jquery';
import { api } from 'shared';
import { Route, navigateTo } from '../routes';

export class Login extends React.Component {
  componentDidMount() {
    let usernameError = true,
      emailError    = true,
      passwordError = true,
      passConfirm   = true;

    // Detect browser for css purpose
    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
        $('.m-login .form form label').addClass('fontSwitch');
    }

    // Label effect
    $('.m-login input').focus(function () {
      $(this).siblings('label').addClass('active');
    });

    // Form validation
    $('.m-login input').blur(function () {

      // User Name
      if ($(this).hasClass('name')) {
        if ($(this).val().length === 0) {
          $(this).siblings('span.error').text('Please type your full name').fadeIn().parent('.form-group').addClass('hasError');
          usernameError = true;
        } else if ($(this).val().length > 1 && $(this).val().length <= 6) {
          $(this).siblings('span.error').text('Please type at least 6 characters').fadeIn().parent('.form-group').addClass('hasError');
          usernameError = true;
        } else {
          $(this).siblings('.error').text('').fadeOut().parent('.form-group').removeClass('hasError');
          usernameError = false;
        }
      }
      // Email
      if ($(this).hasClass('email')) {
        if ($(this).val().length == '') {
          $(this).siblings('span.error').text('Please type your email address').fadeIn().parent('.form-group').addClass('hasError');
          emailError = true;
        } else {
          $(this).siblings('.error').text('').fadeOut().parent('.form-group').removeClass('hasError');
          emailError = false;
        }
      }

        // PassWord
      if ($(this).hasClass('pass')) {
        if ($(this).val().length < 8) {
          $(this).siblings('span.error').text('Please type at least 8 charcters').fadeIn().parent('.form-group').addClass('hasError');
          passwordError = true;
        } else {
          $(this).siblings('.error').text('').fadeOut().parent('.form-group').removeClass('hasError');
          passwordError = false;
        }
      }

      // PassWord confirmation
      if ($('.m-login .pass').val() !== $('.m-login .passConfirm').val()) {
          $('.m-login .passConfirm').siblings('.error').text('Passwords don\'t match').fadeIn().parent('.form-group').addClass('hasError');
          passConfirm = false;
      } else {
          $('.m-login .passConfirm').siblings('.error').text('').fadeOut().parent('.form-group').removeClass('hasError');
          passConfirm = false;
      }

      // label effect
      if ($(this).val().length > 0) {
          $(this).siblings('label').addClass('active');
      } else {
          $(this).siblings('label').removeClass('active');
      }
    });


    // form switch
    $('.m-login a.switch').click(function (e) {
        $(this).toggleClass('active');
        e.preventDefault();

        if ($('.m-login a.switch').hasClass('active')) {
            $(this).parents('.form-peice').addClass('switched').siblings('.form-peice').removeClass('switched');
        } else {
            $(this).parents('.form-peice').removeClass('switched').siblings('.form-peice').addClass('switched');
        }
    });


    // Form submit
    $('.m-login form.signup-form').submit(function (event) {
        event.preventDefault();

        if (usernameError || emailError || passwordError || passConfirm) {
            $('.m-login .name,.m-login .email,.m-login .pass,.m-login .passConfirm').blur();
        } else {
            $('.m-login .signup,.m-login .login').addClass('switched');

            setTimeout(function () { $('.m-login .signup,.m-login .login').hide(); }, 700);
            setTimeout(function () { $('.m-login .brand').addClass('active'); }, 300);
            setTimeout(function () { $('.m-login .heading').addClass('active'); }, 600);
            setTimeout(function () { $('.m-login .form').hide(); }, 700);
        }
    });
}

  render() {
    return (
        <div className="m-login container">
            <section id="formHolder">
        
              <div className="row">
        
                  {/* <!-- Brand Box --> */}
                  <div className="col-sm-6 brand">
                    <a href="#" className="logo">TG <span>.</span></a>
        
                    <div className="heading">
                        <h2>TEAM GOLD</h2>
                        <p>Your Right Choice</p>
                    </div>
                  </div>
        
        
                  {/* <!-- Form Box --> */}
                  <div className="col-sm-6 form">
        
                    {/* <!-- Signup Form --> */}
                    <div className="signup form-peice switched">
                        <form className="signup-form" action="#" method="post">

                          <h2 className="welcome">New User?</h2>
                          <h6 className="signup-heading">Sign Up</h6>

                          <div className="form-group">
                              <label htmlFor="email">Email Adderss</label>
                              <input type="email" name="emailAdress" id="email" className="email"/>
                              <span className="error"></span>
                          </div>

                          <div className="form-group">
                              <label htmlFor="password">Password</label>
                              <input type="password" name="password" id="password" className="pass"/>
                              <span className="error"></span>
                          </div>
        
                          <div className="form-group">
                              <label htmlFor="passwordCon">Confirm Password</label>
                              <input type="password" name="passwordCon" id="passwordCon" className="passConfirm"/>
                              <span className="error"></span>
                          </div>
        
                          <div className="form-group">
                            <select className="select">
                              <option value="">Select your School</option>
                              <option value="NHS">Neville High School</option>
                              <option value="NHS">Quachita High School</option>
                              <option value="NHS">West Monroe High School</option>
                              <option value="NHS">Jordon High</option>
                            </select>
                            <span className="error"></span>
                        </div>

                        <div className="form-group">
                          <select className="select">
                            <option value="">Select your Role</option>
                            <option value="NHS">School Coach</option>
                            <option value="NHS">School Admin</option>
                            <option value="NHS">Assignor</option>
                          </select>
                          <span className="error"></span>
                      </div>

                          <div className="CTA">
                              <input type="submit" value="Sign up" id="submit"/>
                              <a href="#" className="switch">I have an account</a>
                          </div>
                        </form>
                    </div>
                    {/* <!-- End Signup Form --> */}


                      {/* <!-- Login Form --> */}
                      <div className="login form-peice ">
                        <form className="login-form" action="#" method="post">
                          <h2 className="welcome">Welcome Back!</h2>
                          <h3 className="SignIN">Sign In</h3>
                          <div className="form-group">
                              <label htmlFor="loginemail">Email Adderss</label>
                              <input type="email" name="loginemail" id="loginemail" required/>
                          </div>
        
                          <div className="form-group">
                              <label htmlFor="loginPassword">Password</label>
                              <input type="password" name="loginPassword" id="loginPassword" required/>
                          </div>
        
                          <div className="CTA">
                              <input type="submit" value="Login"/>
                              <a href="#" className="switch">I am a New User</a>
                          </div>
                        </form>
                    </div>
                    {/* <!-- End Login Form --> */}

                  </div>
              </div>
        
            </section>
        
        
            <footer>
              <p>
                  <a href="#" target="_blank">TEAMGOLD © 2020</a>
              </p>
            </footer>
        
        </div>
    );
  }


}

// export class Login extends React.Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//       email: '',
//       password: '',
//       canSubmit: false
//     }
//   }

//   handleEmailChange = e => {
//     this.setState({ email: e.target.value }, () => { this.postFormUpdate(); })
//   }

//   handlePasswordChange = e => {
//     this.setState({ password: e.target.value }, () => { this.postFormUpdate(); })
//   }

//   postFormUpdate = () => {
//     const canSubmit = !!(this.state.email && this.state.password);
//     if (this.state.canSubmit !== canSubmit) {
//       this.setState({ canSubmit });
//     }
//   }

//   handleSubmit = e => {
//     e.preventDefault();
//     const { email, password, canSubmit } = this.state;
//     if (!canSubmit) return;

//     const { actions } = this.props;
    
//     actions.showLoading('Login');
//     api.login({ email, password })
//       .then(() => {
//         return api.getMe();
//       })
//       .then(user => {
//         actions.updateState([
//           navigateTo(Route.School()),
//           { user }
//         ]);
//         actions.showMessage(`Welcome, ${user.name}`);
//       })
//       .catch(err => {
//         actions.showError(err.message || err);
//       })
//       .finally(() => {
//         actions.hideLoading('Login');
//       });
//   }

//   render() {
//     const { email, password, canSubmit } = this.state;
//     return null;
//   }
// }

Login.showNavbar = false;
