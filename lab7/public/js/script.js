/* jshint browser: true, devel: true, unused: true, globalstrict: true */
/* global $: false */


'use strict';

var wynikLogowania = checkIfLoggedIn();  //  SPrawdza status czy zalogowany jest user Admin
var tytuł;
var autor; 
var gatunek; 

var goRoot = function(){
      $('h1').removeClass('clickable').click(null);
      $('nav').removeClass('small');
      $('form').css('display', 'none');
      $('section h2').css('display', 'none');
      $('section table').remove();
};

function openForm() {
   $('#myForm').css('display', 'block');
}
 
function closeForm() {
   $('#myForm').css('display', 'none');
}

function confirmLoginForm( ) {
   $('#myForm').css('display', 'none');
   var loginInput=$('input', this).eq(3);  
   var passwordInput=$('input', this).eq(4); 
   
   var login = loginInput.val(); 
   var password = passwordInput.val(); 

   var loginData = { 'login' : login, 'password' : password };
   console.log("Json logowania: " + loginData.login + " " + loginData.password);

   $.post({
      traditional: true,
      url: '/logmein',
      contentType: 'application/json',
      data: JSON.stringify( loginData ),
      dataType: 'json',
      success: function(response){ 
         console.log( response );
      },
      error : function(response){ 
         console.log( response );
      },
      timeout : function(response){ 
         console.log( response );    
      },
   } );

   wynikLogowania = checkIfLoggedIn(); // po zalogowaniu ponownie ustala "status zalogowania"
}

function getShowGenre(genre){
   return function(){
         $.getJSON('/genre/'+ genre, function(data, status){
            if(status == 'success'){
               $('nav').addClass('small'); // Nadaje nową klasę do nawigacji (small)
               $('h1').addClass('clickable').click(goRoot); // przycisk staje się klikalny i odsyła do pierwszego widoku
               $('form').css('display', 'block'); // sposób wyświtlania danych w formularzu na blokowy
               $('section table').remove(); //  Po kliknięciu w element nawigacji występuje tworzenie nowej tablicy ( inaczej by dodawał kolejną).
               
               var table=$('<table></table>');
               var tableTitle = $("<tr>"
               + "<th id='author'><strong>Autor:</strong></td>"
               + "<th id='title'><strong>Tytuł:</strong></td>"
               + "</tr>");
               table.append(tableTitle);
               
               $.each(data, function(index, value){
                  var tr=$('<tr></tr>').append(
                     $('<td></td>').addClass('author').text(value[1] + ':'),
                     ' ',                          
                     $('<td></td>').addClass('title').text(value[0])
                  );
                  table.append(tr);
               });

               $('section h2').css('display', 'block').text(genre).after(table);
            }
            else {
               alert(status);
               console.log("Nie udało się wczytac nowej listy ksiazk w Genre:" + genre);
            }

         });
   };
}

function addingNewBookMessage(currentGenre, reason ,title, author, genre) {
   if(reason === "timeouted")
      alertify.error("Wykryto problemy z połączeniem siecowym, spóbuj ponownie za chwilę: " + reason);
   else if(reason === "error")
      alertify.error("Nie udało się dodać nowej pozycji, spóbuj ponownie, lub skontaktuj się z administracją: " + reason);
   else if(reason === "success"){
      alertify.notify("Książkę dodano do bazy: "
      + reason 
      + " \nTytuł: " + title
      + " \nAutor: " + author
      + " \nGatunek: " + genre,
      'success', 5, function(){  console.log('addingNewBook was Successfull - just a success message'); });
   }
   else if(reason === "logout"){
      alertify.notify("Wylogowano...", 'success');
   }
}

function refreshGenre(currentGenre) {
   //alert("Wszedlem do refresh Genre: " + currentGenre);
   /* Update books from Before you logged in */
   if (wynikLogowania){   // gdy wylogujemy się to należy wywalić to.
      $(".menu-logout").css('display', 'inline');
   }
   $.getJSON('/genre/'+ currentGenre, function(data, status){  // Pobiera nowego JSONA z danymi na temat określonego gatunku.
      if(status == 'success'){
         $('section table').remove(); //  Wywalamy starą tabelę.
         var table=$('<table></table>'); 
         var tableTitle = $("<tr>"
         + "<th id='author'><strong>Autor:</strong></td>"
         + "<th id='title'><strong>Tytuł:</strong></td>"
         + "</tr>");
         table.append(tableTitle);
         
         $.each(data, function(index, value){
            var tr=$('<tr></tr>').append(
               $('<td></td>').addClass('author').text(value[1] + ':'),
               ' ',                          
               $('<td></td>').addClass('title').text(value[0])
            );
            table.append(tr);
         });

         $('section h2').css('display', 'block').text(currentGenre).after(table);
      }
      else {
         alert(status);
         console.log("Nie udało się wczytac nowej listy ksiazk w Genre:" + genre);
      }

   });
         

}

function checkIfLoggedIn(){
   
   $(".menu-logout").css('display', 'none');  // Ukrywa przycisk po nacisnięciu w Logout

   $.getJSON('/login', function(data, status){
      console.log("DANE Z JSONA CHECK IF LOGGED IN: " + data.status);
      if(status == 'success'){
         console.log("Odebrano JSonem: " + data.status +"  "+ data.id +"  "+ data.login +"  "+ data.password);

         if( data.status == true){
            console.log("Zwracam TRU do zmiennej wynikLogowania");
            wynikLogowania = true;

            if( $( "table" ).length ){  // sprawdza czy mamy istniejący element <table> bo poniższa funkcja kasuje <table> przez funkcje refreshTable i tworzy ja od nowa - błąd w ekranie głównym gdy wcisniemy ctrl+f5 to zaczyta od nowa fukncje
               sendPreLoginBooksAfterPositiveLogin();
            }

         }
         else if (data.status == false){
            console.log("data.status == false");
            wynikLogowania = false;
         }

      }
      else {
         alert(status);
         console.log("Nie jesteś zalogowany, bo nie udalo sie pobrać danych z serwera." + data);
         wynikLogowania = false;
      }
      
   });

}


var postBook=function(){
   // https://api.jquery.com/jquery.post/   -> jquery post()
   // https://www.npmjs.com/package/express-session   -> express -> cookies
   var titleInput=$('input', this).eq(0);
   var authorInput=$('input', this).eq(1);
   
   var newTitle = titleInput.val(); 
   var newAuthor = authorInput.val();   
   var currentGenre = $('h2').html(); 
   
   var newRecord = { 'title' : newTitle, 'author' : newAuthor, 'genre' : currentGenre };
   
   console.log("ISLOGGEDinORnot: "  + wynikLogowania);

   if ( !wynikLogowania ){  // Gdy NIE jesteśmy zalogowani to odpal funkcje openForm - otwiera formularz i zapisuje tymczasowo dane o naszej ksiażce sprzed logowania
      openForm();
      tytuł = newTitle;
      autor = newAuthor;
      gatunek = currentGenre;
   }
   if ( wynikLogowania ){  // Gdy jesteśmy zalogowani to dodaj książkę i odśwież tylko tabele.
      $.post({
         traditional: true,
         url: '/:gen',
         contentType: 'application/json',
         data: JSON.stringify( newRecord ),
         dataType: 'json',
         success: function(response){ 
            console.log( response );
            refreshGenre(currentGenre);
            addingNewBookMessage(currentGenre, "success", newTitle, newAuthor, currentGenre);       
         },
         error : function(response){ 
            console.log( response );
            addingNewBookMessage(currentGenre, "error");
         },
         timeout : function(response){ 
            console.log( response );
            addingNewBookMessage(currentGenre, "timeouted");   
         },
      } );
   }


   //alert('New title: \t\t'+newTitle+'\nNew author: \t'+newAuthor+'\nNew genre: \t\t'+currentGenre);
   titleInput.val('');
   authorInput.val('');
   return false;
};

function sendPreLoginBooksAfterPositiveLogin(){
   console.log("ODPALONO SEND PRE LOGIN BOOKS");
   console.log("Wynik logowania: "+ wynikLogowania + ", tytuł: " + tytuł + " ,autor: "+ autor + " ,gatunek: " + gatunek);

   if (wynikLogowania && tytuł != undefined && autor != undefined && gatunek != undefined){
      var preLoginRecord = { 'title' : tytuł, 'author' : autor, 'genre' : gatunek };
      $.post({
         traditional: true,
         url: '/:gen',
         contentType: 'application/json',
         data: JSON.stringify( preLoginRecord ),
         dataType: 'json',
         success: function(response){ 
            console.log( response );
            addingNewBookMessage(gatunek, "success", tytuł, autor, gatunek);       
         },
         error : function(response){ 
            console.log( response );
            addingNewBookMessage(gatunek, "error");
         },
         timeout : function(response){ 
            console.log( response );
            addingNewBookMessage(gatunek, "timeouted");   
         },
      } );
   }

   refreshGenre(gatunek);
   tytuł = undefined;
   autor = undefined;
   gatunek = undefined;
}


function logoutUser(){
   return function(){
         var logoutData = { 'instruction' : 'terminate' };
         console.log("Dzejson Wylogowania: " + logoutData.instruction);  // to sie na bank zgadza. wiec czemu nie wysyła danych dalej?
      
         $.post({
            traditional: true,
            url: '/:gen',
            contentType: 'application/json',
            data: JSON.stringify( logoutData ),
            dataType: 'json',
            success: function(response){ 
               console.log( response );
               console.log("Pomyśłne wysłano DZEJSON DO Wylogowania na /POST/LOGIN");
               wynikLogowania = checkIfLoggedIn();
            },
            error : function(response){ 
               console.log( response );
            },
            timeout : function(response){ 
               console.log( response );    
            },
         } );

         wynikLogowania = checkIfLoggedIn();
         addingNewBookMessage(gatunek, "logout");
   };
}

var setup = function() {
   $('.form-book').submit(postBook);
   $.getJSON('/genres', function(data, status){
      if(status == 'success'){
         $.each(data, function(index, value){
            var li = $('<li></li>').text(value).addClass('clickable').click(getShowGenre(value));
            $('nav ul').append(li);
         });
         var button = $("<li></li>").text("Logout").addClass('menu-logout clickable').css('display', 'none').click(logoutUser());
         $('nav ul').append(button);
      }
      else alert(status);
   });
};

$(document).ready(setup);
