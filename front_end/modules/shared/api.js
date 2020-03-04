import $ from 'jquery';
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
export function getGames() {
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
export function getVerify() {
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
export function getEvents() {
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
export function getTeams() {
    return Promise.resolve()
        .then(() => {
            return [
                {
                    id: 1, 
                    teamName: 'Neville High School Var Girls'
                },

                {
                    id: 2, 
                    teamName: 'Neville High School JV Girls'
                },

                {
                    id: 3, 
                    teamName: 'Neville High School Var Boys'
                },

                {
                    id: 4, 
                    teamName: 'Neville High School JV Boys'
                },

                {
                    id: 5, 
                    teamName: 'Ginsburg High School Var Girls'
                },

                {
                    id: 6, 
                    teamName: 'Ginsburg High School JV Girls'
                },

                {
                    id: 7, 
                    teamName: 'Ginsburg High School Var Boys'
                },

                {
                    id: 8, 
                    teamName: 'Ginsburg High School JV Boys'
                },
                
                {
                    id: 9, 
                    teamName: 'West Monroe High School Var Girls'
                },

                {
                    id: 10, 
                    teamName: 'West Monroe High School JV Girls'
                },

                {
                    id: 11, 
                    teamName: 'West Monroe High School Var Boys'
                },

                {
                    id: 12, 
                    teamName: 'West Monroe High School JV Boys'
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
export function addGame(game){
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