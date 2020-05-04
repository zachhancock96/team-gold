import React from "react";
import $ from "jquery";

export class View extends React.Component {
  componentWillMount() {
    $("head").append(`<style id="styles-login">${css}</style>`);
  }

  componentWillUnmount() {
    $("#styles-login").remove();
  }

  componentDidMount() {
    // Label effect
    $(".m-login input").focus(function () {
      $(this).siblings("label").addClass("active");
    });

    // //Preloader
    $("#bg").delay(2000).slideToggle("slow");
    $("#outer-bg").delay(2000).slideToggle("slow");

    // Form validation
    $(".m-login input").blur(function () {
      // User Name
      if ($(this).hasClass("name")) {
        if ($(this).val().length === 0) {
          $(this)
            .siblings("span.error")
            .text("Please type your full name")
            .fadeIn()
            .parent(".form-group")
            .addClass("hasError");
        } else if ($(this).val().length > 1 && $(this).val().length <= 6) {
          $(this)
            .siblings("span.error")
            .text("Please type at least 6 characters")
            .fadeIn()
            .parent(".form-group")
            .addClass("hasError");
        } else {
          $(this)
            .siblings(".error")
            .text("")
            .fadeOut()
            .parent(".form-group")
            .removeClass("hasError");
        }
      }
      // Email
      if ($(this).hasClass("email")) {
        if ($(this).val().length == "") {
          $(this)
            .siblings("span.error")
            .text("Please type your email address")
            .fadeIn()
            .parent(".form-group")
            .addClass("hasError");
        } else {
          $(this)
            .siblings(".error")
            .text("")
            .fadeOut()
            .parent(".form-group")
            .removeClass("hasError");
        }
      }

      // PassWord
      if ($(this).hasClass("pass")) {
        if ($(this).val().length < 8) {
          $(this)
            .siblings("span.error")
            .text("Please type at least 8 charcters")
            .fadeIn()
            .parent(".form-group")
            .addClass("hasError");
        } else {
          $(this)
            .siblings(".error")
            .text("")
            .fadeOut()
            .parent(".form-group")
            .removeClass("hasError");
        }
      }

      // PassWord confirmation
      if ($(".m-login .pass").val() !== $(".m-login .passConfirm").val()) {
        $(".m-login .passConfirm")
          .siblings(".error")
          .text("Passwords don't match")
          .fadeIn()
          .parent(".form-group")
          .addClass("hasError");
      } else {
        $(".m-login .passConfirm")
          .siblings(".error")
          .text("")
          .fadeOut()
          .parent(".form-group")
          .removeClass("hasError");
      }

      // label effect
      if ($(this).val().length > 0) {
        $(this).siblings("label").addClass("active");
      } else {
        $(this).siblings("label").removeClass("active");
      }
    });

    // form switch
    $(".m-login a.switch").click(function (e) {
      $(this).toggleClass("active");
      e.preventDefault();

      if ($(".m-login a.switch").hasClass("active")) {
        $(this)
          .parents(".form-peice")
          .addClass("switched")
          .siblings(".form-peice")
          .removeClass("switched");
      } else {
        $(this)
          .parents(".form-peice")
          .removeClass("switched")
          .siblings(".form-peice")
          .addClass("switched");
      }
    });
  }

  endAnimating = false;

  componentDidUpdate() {
    const { props } = this;
    if (props.shouldAnimateEnd && !this.endAnimating) {
      this.endAnimating = true;

      $(".m-login .signup,.m-login .login").addClass("switched");

      setTimeout(() => {
        $(".m-login .signup,.m-login .login").hide();
      }, 700);
      setTimeout(() => {
        $(".m-login .brand").addClass("active");
      }, 300);
      setTimeout(() => {
        $(".m-login .heading").addClass("active");
      }, 600);
      setTimeout(() => {
        $(".m-login .form").hide();
      }, 700);

      setTimeout(props.onEndAnimationEnded, 1800);
    }
  }

  render() {
    const m = this.props;
    const { login, signup, schools, roles } = m;

    return (
      <div className="outer-container">
      <div id="outer-bg">
        <div id="bg">
          <img src="img/team_gold_logo.png"></img>
        </div>
      </div>

        <div className="m-login container">
          <section id="formHolder">
          <div className="row">
            {/* <!-- Brand Box --> */}
            <div className="col-sm-6 brand">
              <a href="#" className="logo">
                TG <span>.</span>
              </a>

              <div className="heading">
                <h2>TEAM GOLD</h2>
                <p>Soccer Calender</p>
              </div>
            </div>

            {/* <!-- Form Box --> */}
            <div className="col-sm-6 form">
              {/* <!-- Signup Form --> */}
              <div className="signup form-peice switched">
                <form
                  className="signup-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    m.onSignupSubmit();
                  }}
                >
                  <h2 className="welcome">New User?</h2>
                  <h6 className="signup-heading">Sign Up</h6>

                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      className="name"
                      onChange={(e) => m.onSignupNameChange(e.target.value)}
                      value={signup.name}
                    />
                    <span className="error"></span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Adderss</label>
                    <input
                      type="email"
                      name="emailAdress"
                      id="email"
                      className="email"
                      onChange={(e) => m.onSignupEmailChange(e.target.value)}
                      value={signup.email}
                    />
                    <span className="error"></span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      className="pass"
                      onChange={(e) => m.onSignupPasswordChange(e.target.value)}
                      value={signup.password}
                    />
                    <span className="error"></span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="passwordCon">Confirm Password</label>
                    <input
                      type="password"
                      name="passwordCon"
                      id="passwordCon"
                      className="passConfirm"
                      value={signup.confirmPassword}
                      onChange={(e) =>
                        m.onSignupConfirmPasswordChange(e.target.value)
                      }
                    />
                    <span className="error"></span>
                  </div>

                  <br />

                  <div className="form-group">
                    <select
                      className="select"
                      value={signup.schoolId}
                      onChange={(e) =>
                        m.onSignupSchoolChange(parseInt(e.target.value))
                      }
                    >
                      {schools.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <span className="error"></span>
                  </div>

                  <div className="form-group">
                    <select
                      className="select"
                      value={signup.role}
                      onChange={(e) => m.onSignupRoleChange(e.target.value)}
                    >
                      {roles.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                    <span className="error"></span>
                  </div>

                  <div className="CTA">
                    <input type="submit" value="Sign up" />
                    <a href="#" className="switch">
                      I have an account
                    </a>
                  </div>
                </form>
              </div>
              {/* <!-- End Signup Form --> */}

              {/* <!-- Login Form --> */}
              <div className="login form-peice ">
                <form
                  className="login-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    m.onLoginSubmit();
                  }}
                >
                  <h2 className="welcome">Welcome Back!</h2>
                  <h3 className="SignIN">Sign In</h3>
                  <div className="form-group">
                    <label htmlFor="loginemail">Email Adderss</label>
                    <input
                      type="email"
                      name="loginemail"
                      id="loginemail"
                      onChange={(e) => m.onLoginEmailChange(e.target.value)}
                      value={login.email}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="loginPassword">Password</label>
                    <input
                      type="password"
                      name="loginPassword"
                      id="loginPassword"
                      onChange={(e) => m.onLoginPasswordChange(e.target.value)}
                      value={login.password}
                      required
                    />
                  </div>

                  <div className="CTA">
                    <input
                      type="submit"
                      value="Login"
                      disabled={!login.canSubmit}
                    />
                    <a href="#" className="switch">
                      I am a New User
                    </a>
                  </div>
                </form>
              </div>
              {/* <!-- End Login Form --> */}
            </div>
          </div>
        </section>
        <footer>
          <p>
            <a href="#" target="_blank">
              TEAMGOLD © 2020
            </a>
          </p>
        </footer>
      </div>
      </div>
    );
  }
}

const css = `
body {
  font-family: "Raleway", sans-serif;
  background: linear-gradient(180deg, rgba(250,235,215,1) 0%, rgba(191,179,163,1) 35%, rgba(77,74,71,1) 100%);
}

.m-login .container {
  max-width: 900px;
}

.m-login a {
  display: inline-block;
  text-decoration: none;
}

.m-login input {
  outline: none ;
}

.m-login h1 {
  text-align: center;
  text-transform: uppercase;
  margin-bottom: 40px;
  font-weight: 700;
}

.m-login section#formHolder {
  padding: 50px 0;
}

.m-login .brand {
  padding: 20px;
  background: url('img/soccer-image.jpg');
  background-size: cover;
  background-position: center center;
  color: #fff;
  min-height: 600px;
  position: relative;
  box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.3);
  transition: all 0.6s cubic-bezier(1, -0.375, 0.285, 0.995);
  z-index: 9999; 
}

.m-login .brand.active {
  width: 100%;
}

.m-login .brand::before {
  content: '';
  display: block;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: -1;
}

.m-login .brand a.logo {
  color: #f95959;
  font-size: 20px;
  font-weight: 700;
  text-decoration: none;
  line-height: 1em;
}

.m-login .brand a.logo span {
  font-size: 30px;
  color: #fff;
  transform: translateX(-5px);
  display: inline-block;
}

.m-login .brand .heading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  transition: all 0.6s;
}

.m-login .brand .heading.active {
  top: 100px;
  left: 100px;
  transform: translate(0);
}

.m-login .brand .heading h2 {
  font-size: 60px;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: -10px;
}

.m-login .brand .heading p {
  font-size: 15px;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 2px;
  white-space: 4px;
  font-family: "Raleway", sans-serif;
}

.m-login .brand .success-msg {
  width: 100%;
  text-align: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin-top: 60px;
}

.m-login .brand .success-msg p {
  font-size: 25px;
  font-weight: 400;
  font-family: "Raleway", sans-serif;
}

.m-login .brand .success-msg a {
  font-size: 12px;
  text-transform: uppercase;
  padding: 8px 30px;
  background: #f95959;
  text-decoration: none;
  color: #fff;
  border-radius: 30px;
}

.m-login .brand .success-msg p, .brand .success-msg a {
  transition: all 0.9s;
  transform: translateY(20px);
  opacity: 0;
}

.m-login .brand .success-msg p.active, .brand .success-msg a.active {
  transform: translateY(0);
  opacity: 1;
}

.m-login .form {
  position: relative;
}

.m-login .form .form-peice {
  background: #fff;
  min-height: 560px;
  margin-top: 20px;
  box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.2);
  color: #000000;
  padding: 30px 0 60px;
  transition: all 0.9s cubic-bezier(1, -0.375, 0.285, 0.995);
  position: absolute;
  top: 0;
  left: -30%;
  width: 130%;
  overflow: hidden;
}

.m-login .form .form-peice.switched {
  transform: translateX(-100%);
  width: 100%;
  left: 0;
}

.m-login .form form {
  padding: 0 40px;
  margin: 0;
  width: 70%;
  position: absolute;
  top: 50%;
  left: 60%;
  transform: translate(-50%, -50%);
}

.m-login .form form .form-group {
  margin-top: 8px;
  margin-bottom: 5px;
  position: relative;
}

.m-login .form form .form-group.hasError input {
  border-color: #f95959 ;
}

.m-login .form form .form-group.hasError label {
  color: #f95959 ;
}

.m-login .form form label {
  font-size: 14px;
  font-weight: 400;
  text-transform: uppercase;
  font-family: "Montserrat", sans-serif;
  transform: translateY(40px);
  transition: all 0.4s;
  cursor: text;
  z-index: -1;
}

.m-login .form form label.active {
  transform: translateY(14px);
  font-size: 12px;
}

.m-login .form form label.fontSwitch {
  font-family: "Raleway", sans-serif ;
  font-weight: 600;
}

.m-login .form form input:not([type=submit]) {
  background: none;
  outline: none;
  border: none;
  display: block;
  padding: 10px 0;
  width: 100%;
  border-bottom: 1px solid #eee;
  color: #444;
  font-size: 15px;
  font-family: "Montserrat", sans-serif;
  z-index: 1;
}

.m-login .form form input:not([type=submit]).hasError {
  border-color: #f95959;
}

.m-login .form form span.error {
  color: #f95959;
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  position: absolute;
  bottom: -20px;
  right: 0;
  display: none;
}

.m-login .form form input[type=password] {
  color: #f95959;
}

.m-login .form form .CTA {
  margin-top: 20px;
}

.m-login .form form .CTA input {
  font-size: 12px;
  text-transform: uppercase;
  padding: 8px 30px;
  background: rgb(65, 43, 25);
  color: #fff;
  border-radius: 30px;
  margin-right: 20px;
  border: none;
  font-family: "Montserrat", sans-serif;
}
.m-login .form form .CTA input:hover {
  cursor: pointer;
  transform: scale(1.1);
  background-color:rgb(63, 60, 57);
}
.m-login .form form .CTA a:hover {
  text-transform: uppercase;
  transform: scale(1.1);
}

.m-login .form form .CTA a.switch {
  font-size: 13px;
  font-weight: 400;
  font-family: "Montserrat", sans-serif;
  color: rgb(65, 43, 25);
  text-decoration: underline;
  transition: all 0.3s;
}

.m-login .form form .CTA a.switch:hover {
  color: #7f6fa3;
}

.m-login footer {
  text-align: center;
}

.m-login footer p {
  color: #777;
}

.m-login footer p a, footer p a:focus {
  color: #b8b09f;
  transition: all .3s;
  text-decoration: none ;
}

.m-login footer p a:hover, footer p a:focus:hover {
  color: #f95959;
}

@media (max-width: 768px) {
  .m-login .container {
      overflow: hidden;
  }
  .m-login section#formHolder {
      padding: 0;
  }
  .m-login section#formHolder div.brand {
      min-height: 200px ;
      min-width: 100%;
  }
  .m-login section#formHolder div.brand.active {
      min-height: 100vh ;
  }
  .m-login section#formHolder div.brand .heading.active {
      top: 200px;
      left: 50%;
      transform: translate(-50%, -50%);
  }

  .m-login section#formHolder .form {
      width: 100%;
      heigh: auto;
      min-height: 600px;
      margin-left: 10vw;
      min-width: 80%;
  }
  .m-login section#formHolder .form .form-peice {
      margin: 0;
      top: 0;
      left: 0;
      width: 100% ;
      transition: all .5s ease-in-out;
  }
  .m-login section#formHolder .form .form-peice.switched {
      transform: translateY(-100%);
      width: 100%;
      left: 0;
  }
  .m-login section#formHolder .form .form-peice > form {
      width: 100% ;
      padding: 60px;
      left: 50%;
  }
  
  .m-login footer {
    padding-top: 20px;
  }
}

@media (max-width: 501px) {
  .m-login section#formHolder .form {
      width: 90%;
      margin-left: 10px;
  }
  .m-login h2 {
      font-size: 50px ;
  }
}

.m-login .welcome {
  font-weight: 600;
  font-size: 45px;
  margin-bottom: -15px;
}
.m-login .SignIN {
  font-weight: 600;
  font-size: 25px;
  padding-top: 10px;
}
.m-login .signup-heading {
  font-weight: 600;
  font-size: 25px;
  margin-bottom: -20px;
}

/* SELECT OPTION CSS STARTS */

.m-login .select {
	display: block;
	font-size: 16px;
	font-weight: 500;
	color: #444;
	line-height: 1.3;
	padding: .6em 1.4em .5em .8em;
	width: 100%;
	max-width: 100%;
	box-sizing: border-box;
	margin: 0;
	border: 1px solid #aaa;
	box-shadow: 0 1px 0 1px rgba(0,0,0,.04);
	border-radius: 5px;
	-moz-appearance: none;
	background-color: #fff;
	background-repeat: no-repeat, repeat;
	background-position: right .7em top 50%, 0 0;
  background-size: .65em auto, 100%;
  padding: 8px;
  margin-top: 10px;
}

/* PRELOADER CSS GOES HERE */
/* PRELOADER CSS GOES HERE */
/* PRELOADER CSS GOES HERE */

// .loader {
//   position: fixed;
//   height: 100%;
//   width: 100%;
//   background: linear-gradient(180deg, rgba(205,184,183,1) 16%, rgba(147,116,116,1) 46%, rgba(88,81,73,1) 80%);
//   margin-right: 0px;
//   z-index: 99999;


//   img/team_gold_logo.png
// }

// .logo {
//   display: block;
//   margin-left: auto;
//   margin-right: auto;
//   margin-top: 100px;

// }

#bg {
  position: fixed; 
  top: -50%; 
  left: -50%; 
  width: 200%; 
  height: 200%;
  z-index: 99999;
}
#bg img {
  position: absolute; 
  top: 0; 
  left: 0; 
  right: 0; 
  bottom: 0; 
  margin: auto; 
  height: 300px;
}

#outer-bg {
  position: absolute;
  background: linear-gradient(180deg, rgba(250,235,215,1) 0%, rgba(191,179,163,1) 35%, rgba(77,74,71,1) 100%);
  top: 0; 
  left: 0; 
  right: 0; 
  bottom: 0; 
  margin: auto;   
  z-index: 99999;

}

`;
