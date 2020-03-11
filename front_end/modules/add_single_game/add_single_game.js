import $ from 'jquery';
//this attaches itself to jquery
//for sideffect purpose
import 'jquery-datetimepicker';
import * as api from '../shared/api_new';

//testing api.addGame
const form = (function() {
	const selectHomeTeamEl = $('#select_home_team');
	const selectVisitingTeamEl = $('#select_visiting_team');		
	const locationEl = $('#location');
	const startDateEl = $('#start_date');
	const startTimeEl = $('#start_time');

	//BEGIN: init date time picker
	$.datetimepicker.setLocale('en');

	startTimeEl.datetimepicker({
		datepicker:false,
		format:'H:i',
		step:15
	});

	startDateEl.datetimepicker({
		yearOffset:0,
		lang:'ch',
		timepicker:false,
		format:'m/d/Y',
		formatDate:'Y/m/d',
		minDate:'-1970/01/02', // yesterday is minimum date
		maxDate:'+3000/01/02' // and tommorow is maximum date calendar
	});	
	//END: init date time picker


	const formEl = $('#form');

	let submitListener = null;

	/*
		@param teams: Array<{
			id,
			teamName
		}>
	*/
	function setTeams(teams) {
		let options = teams
			.map(team => `<option value=${team.id}>${team.teamName}</option>`);

		options = ['<option value="">Select team</option>', ...options];
		
		
		//array to string conversion
		options = options.join('');

		//clear select element
		selectHomeTeamEl.empty();
		selectVisitingTeamEl.empty();

		//fill select element
		selectHomeTeamEl.append(options);
		selectVisitingTeamEl.append(options);
	}

	function setSubmitListener(listener) {
		submitListener = listener;
	}

	formEl.on('submit', function(e) {
		e.preventDefault();
		//scrape data out of form elements
		const game = {};
		
		game.homeTeamId = selectHomeTeamEl.val() || null;
		game.awayTeamId = selectVisitingTeamEl.val() || null;
		game.location = locationEl.val() || null;
		

		const dateVal = new Date(startDateEl.val());

		let monthStr = (function() {
			const month = dateVal.getMonth() + 1;
			return month < 10? "0" + month: month + "";
		})();

		let dateStr = (function() {
			const date = dateVal.getDate();
			return date < 10? "0" + date: date + "";
		})();


		var formatDate = dateVal.getFullYear() + "-" + monthStr + "-" + dateStr + "T" + startTimeEl.val() + ":00-05:00";
		
		game.start = formatDate || null;

		if(game.homeTeamId){
			game.homeTeamId = parseInt(game.homeTeamId);
		}
		if(game.awayTeamId){
			game.awayTeamId = parseInt(game.awayTeamId);
		}
		// notify listener
		if (submitListener != null) {
			submitListener(game);
		}
	});

	return {
		setTeams,
		setSubmitListener,
	}
})();


form.setSubmitListener(game => {
	if (game == null
		|| !game.homeTeamId
		|| !game.awayTeamId
		|| !game.location
		|| !game.start) {
			alert('invalid form data');
		}
	else {
		//TODO: add game
		api.addGame(game)
			.then(result => {
				alert('success!');
				console.log(result);
			})
			.catch(error => {
				alert('Oops!');
				console.log(error);
			})
	}
});

api.getTeams()
	.then(teams => {
		teams = teams.map(t => ({
			id: t.id,
			teamName: t.name
		}));
		form.setTeams(teams);
	})
	.catch(err => {
		console.log(err);
	})