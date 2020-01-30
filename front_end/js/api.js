/*
    Assumption: jquery already on global scope

 
    all apis have promise interface



    this module exports api variable to global scope

    api has following interface:

    api: {
        getGames: Promise<Object>
    }
*/

const api = (function() {
    const BASE_URL = "http://18.219.186.34/api/";

    const API_URLS = {
        GET_GAMES: BASE_URL + "games",
        ADD_GAME: BASE_URL + "games"
    };
    
    
    function getGames() {
        return httpGet(API_URLS.GET_GAMES)
            .then(result => result.games);
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
        getTeams,
        addGame
    };



})();
