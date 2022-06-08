'use strict';
const fetch = require('node-fetch');

exports.handleRecommendation = async function (productions, people, categories) {
    //We can have an empty recommendation (recommend me something random), or a
    // recommendation that includes some productions, categories and even people
    handleSearch(['Star Wars'], null);
};


exports.handleSearch = async function (productions, people) {
    //We'll get the first movie or the first person we found, and search for data
    if (productions.length === 0 && people.length === 0) {
        return "Sorry, I can't search that!";
    }

    if (productions.length !== 0) {
        //Query a random production introduced
        //give me info about star wars or superman
        try {
            let query =
                `query {
                prods (
                    where: { title: "${productions[Math.floor(Math.random() * productions.length)]}" }
                    options: {limit: 1}
                ) {
                    title
                    genres
                    runtimeMinutes
                    startYear
                    titleType
                    actors {
                        name
                    }
                    directors {
                        name
                    }
                }
            }`;

            const response = await fetch('http://localhost:4000/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    query
                })
            });

            const jsonResponse = await response.json();
            return buildProductionSearchResponse(jsonResponse.data.prods[0]);
        } catch (e) {
            return "We don't have information about this movie😟 (this is unusual, are you sure you wrote it correctly?)";
        }
    }

    if (people.length !== 0) {
        //Query a random person introduced
        try {
            let query =
                `query {
                people (
                    where: { name: "${people[Math.floor(Math.random() * people.length)]}" }
                    options: {limit: 1}
                ) {
                    name
                    birthYear
                    deathYear
                    primaryProfession
                    moviesActed  (options: {limit: 3} ){
                        title
                    }
                    productions (options: {limit: 3} ) {
                        title
                    }
                    moviesActedConnection {
                        totalCount
                    }
                    productionsConnection {
                        totalCount
                    }
                }
            }`;

            const response = await fetch('http://localhost:4000/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    query
                })
            });

            const jsonResponse = await response.json();
            return buildPersonSearchResponse(jsonResponse.data.people[0]);
        } catch (e) {
            return "We don't have information about this person😢  (this is unusual, are you sure you wrote the name correctly?)";
        }
    };
}


function buildRecommendationResponse(recommendation) {

}

function buildProductionSearchResponse(production) {
    let response = production.title + ' is an ' + production.genres[0] + ', ' +
        production.genres[1] + ' and ' + production.genres[2] + ' ' + production.titleType +
        ' produced by ' + production.directors[0].name + ' in ' + production.startYear + '. It lasts ' +
        production.runtimeMinutes + ' minutes and its most well-known actors are ' +
        production.actors[0].name + ' and ' + production.actors[1].name;

    return response;
}

function buildPersonSearchResponse(person) {
    let response = person.name + ' (' + person.birthYear +
        (person.deathYear ? ' - ' + person.deathYear + ') was ' : ') is ') +
        'a ' + person.primaryProfession[0] + ', ' + person.primaryProfession[1] + ' and ' +
        person.primaryProfession[2] + ' known for ' +
        (person.productionsConnection.totalCount > 0 ? 'directing ' +
            person.productionsConnection.totalCount + ' productions (' +
            person.productions[0].title + ', ' + person.productions[1].title + ' and ' +
            person.productions[2].title + ', among others) ' + 'and ' : '') +
        'acting in ' + person.moviesActedConnection.totalCount + ' movies (' +
        person.moviesActed[0].title + ', ' + person.moviesActed[1].title + ', ' +
        person.moviesActed[2].title + '...).';

    return response;
}