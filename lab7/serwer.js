/*jshint node: true */
'use strict';

var express = require('express');
var app = express();
var session = require('express-session');
var path = require('path');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var baza = require('./db/books');

app.use(session({  // https://www.npmjs.com/package/express-session
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

var users = [
    {status: false , id: '2f24vvg', login: 'admin', password: 'nimda'}
]

app.use(morgan('dev'));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules/jquery/dist')));

app.get('/genres', function (req, res) {
    var genres = baza().distinct("genre").sort();
    res.json(genres);
});

app.get('/genre/:gen', function (req, res) {
    var books = baza({genre: req.params.gen}).order("author").select("title", "author");  // order("author") Sortuje automatycznie po Autorze przy pobieraniu danych z pliku dane.js
    res.json(books);
});

app.listen(3000, function () {
    console.log('Serwer działa na porcie 3000');
});


app.post( '/:gen' , function(req, res){
    console.log(req.body) // zwraca w konsoli serwera co zawiera Json
    var newTitle = req.body.title;
    var newAuthor = req.body.author;
    var newGenre = req.body.genre;
    var loginToCheck = req.body.login;
    var passwordToCheck = req.body.password;
    var logoutInstruction = req.body.instruction;

    if( newTitle != undefined &&  newAuthor != undefined && newGenre != undefined){
        var ifTitleExists = baza().filter({title : newTitle}).select("title");
        var ifAuthorExists = baza().filter({author: newAuthor}).select("author");
        var ifGenreExist = baza().filter({title : newTitle}).select("genre"); 
        console.log("Czy istnieje tytul: " + ifTitleExists + "  Czy istnieje autor: " + ifAuthorExists + "  Czy istnieje ten gatunek: " + ifGenreExist);
    
        if( ifTitleExists == newTitle && ifAuthorExists == newAuthor && ifGenreExist == newGenre){
            console.log("Wybrana ksiazka już istnieje!");
        }
        else {
            console.log("Dodajemy nowa ksiazke. Tytuł: " + newTitle);
            if( newTitle != undefined && newTitle != '' && newAuthor != undefined && newAuthor != '' ){
                baza.insert({"title":newTitle,"author":newAuthor,"genre":newGenre});
            }
            else{
                console.log("Brak danych o ksiazce - nie dodano do bazy");
            }
    
        }
        var books = baza({genre: req.params.gen}).order("author").select("title", "author");
        console.log(books);
        res.end(JSON.stringify(books));
    }
    else if( loginToCheck != undefined && passwordToCheck != undefined){
        if (loginToCheck == users[0].login && passwordToCheck == users[0].password){  // admin, nimda
            users[0].status = true; // zmienia status użytkownika na zalogowano.
            console.log("Status użytkownika: " + users[0].login + " zmieniony na: " + users[0].status + ".");
        }
    }
    else if(logoutInstruction != undefined && logoutInstruction == 'terminate') {
        users[0].status = false;
        console.log("Wylogowano: " + users[0].status + " " + users[0].login );
    }

} );


app.get('/login', function(req,res){
    var person = {"status": users[0].status, "id": users[0].id, "login": users[0].login, "password": users[0].password };
    console.log(".json: dane logowania:" + person.login + "  " + person.password);
    res.end(JSON.stringify(person));
} );


