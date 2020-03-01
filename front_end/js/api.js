/*
    Assumption: jquery already on global scope

 
    all apis have promise interface



    this module exports api variable to global scope

    api has following interface:

    api: {
        getGames: Promise<Object>
    }
*/

const FORMAT_DATE_TIME =  'YYYY-MM-DDTHH:mm:ssZ';

const api = (function() {
    const BASE_URL = "http://18.219.186.34/api/";

    const API_URLS = {
        GET_GAMES: BASE_URL + "games",
        ADD_GAME: BASE_URL + "games"
    };
    
    /*
        [
            {
                id: int,
                homeTeam: {
                id: int,
                name: string,
                abbrevName: string
                },
                awayTeam: {
                id: int,
                name: string,
                abbrevName: string
                },
                start: DateTime (e.g. "2020-03-17T08:00:00-05:00"),
                location: string
            }
        ]

        */
        function getGames() {
            return httpGet(API_URLS.GET_GAMES)
                .then(function(response) {
                    const games = response.games;

                    const result = [];

                    for(var i = 0; i < games.length; i++) {
                        const game = games[i];
                        const title = game.homeTeam.name  + ' vs ' + game.awayTeam.name + ' @ ' + game.location;
                        const start = game.start;
                        const end = start;
                    
                        result.push({
                            title,
                            start,
                            end
                        })
                    }

                    return result;

                });
        }

        /*
        [
            {
                id: int,
                homeTeam: {
                id: int,
                name: string,
                abbrevName: string
                },
                awayTeam: {
                id: int,
                name: string,
                abbrevName: string
                },
                start: DateTime (e.g. "2020-03-17T08:00:00-05:00"),
                location: string
                status: string
            }
        ]

        */
       function getVerify() {
        return httpGet(API_URLS.GET_GAMES)
            .then(function(response) {
                const games = response.games;

                const result = [];

                for(var i = 0; i < games.length; i++) {
                    const game = games[i];
                    if(game.status == 'pend_team'){
                        const title = game.homeTeam.name  + ' vs ' + game.awayTeam.name + ' @ ' + game.location;
                        const start = game.start;
                        const end = start;
                    
                        result.push({
                            title,
                            start,
                            end
                        })
                    }
                }
                return result;

            });
    }

        
        /*
        [
            {
                id: int,
                homeTeam: {
                id: int,
                name: string,
                abbrevName: string
                },
                awayTeam: {
                id: int,
                name: string,
                abbrevName: string
                },
                start: DateTime (e.g. "2020-03-17T08:00:00-05:00"),
                location: string
            }
        ]

        */
       function getEvents() {
            return httpGet(API_URLS.GET_EVENTS)
                .then(function(response) {
                    const games = response.games;

                    const result = [];

                    for(var i = 0; i < games.length; i++) {
                        const game = games[i];
                        const title = game.homeTeam.name  + ' vs ' + game.awayTeam.name + ' @ ' + game.location;
                        const start = game.start;
                        const end = start;
                    
                        result.push({
                            title,
                            start,
                            end
                        })
                    }

                    return result;

                });
        }
    

    //TODO: REPLACE MOCKS WHEN API IS DONE
    function getTeams() {
        return Promise.resolve()
            .then(() => {
                return [
                    {
                        id: 1, 
                        teamName: 'Neville High School Jr. Varsity'
                    },
                    {
                        id: 2, 
                        teamName: 'Ginsburg High School Jr. Varsity'
                    },
                    {
                        id: 3, 
                        teamName: 'West Monroe High School Jr. Varsity'
                    }
                ];
            })
    }
    
    /*
        @param game: {
            homeTeamId,
            awayTeamId,
            start,
            end,
            location
        }
    */
    function addGame(game){
        return httpPost(API_URLS.ADD_GAME, game)
                .then(result => result.gameId)
    }
    /*
        @param url: string,
        @param queryObject: object (optional)
    */
    function httpGet(url, queryObject) {
        queryObject = queryObject || {};
    
        return new Promise(function(resolve, reject) {
            $.ajax({
                url,
    
                //request data type
                contentType: "application/json",
    
                //server response data type
                dataType: "json",
    
                method: "GET",
    
                data: queryObject,
    
                error: function(crap, textStatus, errorThrown) {
                    reject(errorThrown);
                },
    
                success: function(data, textStatus) {
                    console.log('DEBUGGING AJAX GET TEXTSTATUS: ' + textStatus);
                    if (data.ok) {
                        resolve(data);
                    } else {
                        reject(data.reason);
                    }                    
                }
            });
        });
    }

    function httpPost(url, body) {
        body = body || {};
        body = JSON.stringify(body);
    
        return new Promise(function(resolve, reject) {
            $.ajax({
                url,
    
                //request data type
                contentType: "application/json",
    
                //server response data type
                dataType: "json",
    
                method: "POST",
    
                data: body,

                processData: false,
    
                error: function(crap, textStatus, errorThrown) {
                    reject(errorThrown);
                },
    
                success: function(data, textStatus) {
                    console.log('DEBUGGING AJAX GET TEXTSTATUS: ' + textStatus);
                    if (data.ok) {
                        resolve(data);
                    } else {
                        reject(data.reason);
                    }                    
                }
            });
        });
    }

    return {
        getGames,
        getVerify,
        getEvents,
        getTeams,
        addGame
    };



})();




/*
[
    {
        id: int,
        homeTeam: {
          id: int,
          name: string,
          abbrevName: string
        },
        awayTeam: {
          id: int,
          name: string,
          abbrevName: string
        },
        start: DateTime (e.g. "2020-03-17T08:00:00-05:00"),
        location: string
    }
  ]

*/
function getGames() {
    return httpGet(API_URLS.GET_GAMES)
        .then(function(response) {
            const games = response.games;

            const result = [];

            for(var i = 0; i < games.length; i++) {
                const game = games[i];
                const title = game.homeTeam.name  + ' vs ' + game.awayTeam.name;
                const start = game.start;
                const end = moment(start).add(1.5, 'hours').format(FORMAT_DATE_TIME);
                const status = game.status;
            
                result.push({
                    title,
                    start,
                    end
                })
            }

            return result;

        });
}


/*
[
    {
        id: int,
        homeTeam: {
          id: int,
          name: string,
          abbrevName: string
        },
        awayTeam: {
          id: int,
          name: string,
          abbrevName: string
        },
        start: DateTime (e.g. "2020-03-17T08:00:00-05:00"),
        location: string
    }
  ]

*/
function getEvents() {
    return httpGet(API_URLS.GET_GAMES)
        .then(function(response) {
            const games = response.games;

            const result = [];

            for(var i = 0; i < games.length; i++) {
                const game = games[i];
                const title = game.homeTeam.name  + ' vs ' + game.awayTeam.name + ' @ ' + game.location;
                const start = game.start;
                const end = moment(start).add(1.5, 'hours').format(FORMAT_DATE_TIME);
            
                result.push({
                    title,
                    start,
                    end
                })
            }

            return result;

        });
}


function getVerify() {
    return httpGet(API_URLS.GET_GAMES)
        .then(function(response) {
            const games = response.games;

            const result = [];

            for(var i = 0; i < games.length; i++) {
                const game = games[i];
                if(game.status = 'pend_team'){
                    const title = game.homeTeam.name  + ' vs ' + game.awayTeam.name + ' @ ' + game.location;
                    const start = game.start;
                    const end = start;
                
                    result.push({
                        title,
                        start,
                        end
                    })
                }
            }

            return result;

        });
    }