import $ from 'jquery';
import * as api from '../shared/api_new';

const form = (function() {
  const formEl = $('#form_login');
  const emailEl = $('#email');
  const passwordEl = $('#password');

  let listener;

  formEl.on('submit', function(e) {
    e.preventDefault();

    const email = emailEl.val() || null;
    const password = passwordEl.val() || null;

    if (listener) {
      listener({email, password});
    }
  });

  return {
    setOnSubmitListener: function(f) {
      listener = f;
    }
  };
})();

const calendarOverlay = (function() {
  const overlayEl = $('#calendar_overlay');
  let listener;

  overlayEl.on('click', () => {
    if (listener) {
      listener();
    }
  })

  return {
    setOnClickListener: function(f) {
      listener = f;
    }
  }
})();

form.setOnSubmitListener((args) => {
  if (!args.email || !args.password) {
    alert('invalid form');
    return;
  }

  api.login(args)
    .then(() => {
      redirectToHome();
    })
    .catch(err => {
      alert('error: ' + err);
    });
});

const sessionId = localStorage.getItem('sessionId');
if (sessionId) {
  redirectToHome();
}

function redirectToHome() {
  console.log('redirecting');
  const protocol = window.location.protocol;
  if (protocol === 'file:') {
    //e.g. file:///C:/Users/kenichi/Desktop/team-gold/front_end/html/game_view.html"
    let href = window.location.href

    for(let i = href.length - 1; i >= 0; i--) { 
      if (href.charAt(i) == '/') { 
        let gameViewHref = href.substring(0 , i) + '/game_view.html'
        window.location.href = gameViewHref;
        break;
      }
    }
  } else {
    //http or https
    //TODO:
    window.location.href = window.location.origin + '/game_view.html'
  }
}