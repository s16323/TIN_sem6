/*jshint globalstrict: true, devel: true, node: true */
'use strict';

var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var morgan = require('morgan');
const file = './db/books.js';
var baza = require(file);
const fs = require('fs');
const baseRecordCountAtBeggining = baza().count('*');

app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    var genres = baza().distinct("genre").sort(); // Dopis sort sortuje wyniki "albumy", "bajki", "etc"
    res.render('index.ejs', {genres: genres});
});

app.get('/:gen', function (req, res) {
    var genres = baza().distinct("genre").sort();
    var books = baza({genre: req.params.gen}).select("title", "author");
    var genre = req.params.gen;
    res.render('index.ejs', {genres: genres, books: books, genre: genre});
});

app.post('/:gen', function (req, res) {
    var newAuthor = req.body.author;
    var newTitle = req.body.title;
    var genre = req.params.gen;
    var login = req.body.login;
    var password = req.body.password;

    const adminLogin = "admin";
    const adminPassword = "nimda";

    console.log("Author: "+ newAuthor,".Title: " + newTitle, ".Genre: " + genre, ".Login: " + login, ".Password: " + password);
    
    if( login === adminLogin && password === adminPassword)
        baza.insert({"title":newTitle,"author":newAuthor,"genre":genre});
    else
        console.log("Podano złe dane logowania!");

    var genres = baza().distinct("genre"); 
    var books = baza({genre: genre}).select("title", "author");
    res.render('index.ejs', {genres: genres, books: books, genre: genre});
});


app.listen(3000, function () {
    console.log('Serwer działa na porcie 3000');
});


process.on('SIGINT',function(){
// https://nodejs.org/api/fs.html
// http://taffydb.com/working_with_data.html
// https://justcode.me/how-to/remove-text-from-string-in-javascript/

  console.log('\nshutting down');

    // Check if the file exists in the current directory, and if it is writable.
    fs.access(file, fs.constants.F_OK | fs.constants.W_OK, (err) => {
        if (err) {
            console.error(
                `${file} ${err.code === 'ENOENT' ? 'File does not exist' : ' and is read-only'}`);
        } else {
            console.log(`${file} File exists, and it is writable, proceed with writing data`);
            if (baza().count("title") > baseRecordCountAtBeggining ){
                console.log("Aktualizacja bazy danych...");
                console.log("Liczba rekordów przed aktualizacją: " + baseRecordCountAtBeggining);
                console.log("Liczba rekordów po aktualizacji: " + baza().count('*') );
                
                var begin = "/* jshint node: true */ \n var TAFFY = require('taffy'); \n var books = TAFFY( \n"; 
                var bazaJSON = baza().stringify();
                var bazaJSON = bazaJSON.replace(/ *\,"_[^}]*\e */g, "");
                var bazaJSON = bazaJSON.replace (/},{/g , "},\n{");
                var end = "); \n module.exports = books;"
            
                try {
                    fs.writeFileSync(file, begin);
                    fs.appendFileSync(file, bazaJSON);
                    fs.appendFileSync(file, end);
                    console.log('The "data to append" was appended to file successfuly!');
                    process.exit();
                } catch (err) {
                    console.log("Uuups.. coś poszło nie tak i nie dodano rekordów do bazy danych, sprawdź plik z bazą..");
                }
          
            }
            else{
                console.log("Nie dodano rekordów, więc nie zmieniamy pliku book.js");
                process.exit();
            }
        }
    });

});
