/* jshint browser: true, globalstrict: true, devel: true */
/* global io: false */
"use strict";

// Inicjalizacja
document.addEventListener("DOMContentLoaded", function (event) {
    var status = document.getElementById("status");
    var open = document.getElementById("open");
    var close = document.getElementById("close");
    var send = document.getElementById("send");
    var text = document.getElementById("text");
    var nick = document.getElementById("nick");             // uchwyt pola 'nick' z dokumentu
    var message = document.getElementById("message");       // uchwyt pola 'message' z dokumentu
    var online = document.getElementById("onlineField");    // uchwyt pola 'onlineField' z dokumentu
    var socket;

    status.textContent = "Brak połącznia";
    close.disabled = true;
    send.disabled = true;

    // Po kliknięciu guzika „Połącz” tworzymy nowe połączenie WS
    open.addEventListener("click", function (event) {
        open.disabled = true;
        if (!socket || !socket.connected) {
            socket = io({forceNew: true});
        }
        socket.on('connect', function () {
            close.disabled = false;
            send.disabled = false;
            status.src = "img/bullet_green.png";
            // online.textContent = online.innerText;      // tu nowe
            console.log('Nawiązano połączenie przez Socket.io');
            socket.emit("nick", nick.value+' connected to server');
            // socket.emit("online", nick.value);
            //online.textContent += 'User: '+nick.value +' Connected\n'; // wiadomosc wyswietla się po lewej jak user się zaloguje
        });
        socket.on('disconnect', function () {
            open.disabled = false;
            status.src = "img/bullet_red.png";
            console.log('Połączenie przez Socket.io zostało zakończone');
            //online.textContent = 'User: '+nick.value +' Disconnected'; // wiadomosc wyswietla się po prawej jak user się wyloguje
            //online.textContent = '';        // user po wylogowaniu znika z lewej
            socket.emit("ofline", nick.value);
            online.value = "";
        });
        socket.on("error", function (err) {
            message.textContent = "Błąd połączenia z serwerem: '" + JSON.stringify(err) + "'";
        });
        socket.on("echo", function (data) {
            message.textContent = "Serwer twierdzi, że otrzymał"+ " '" + data + "'";
        });
         socket.on("nick_ok", function (data) {
            message.textContent =  data;
            //online.textContent = data;
        });
        socket.on("online_ok", function (data) {
            online.textContent =  data ;
        });
    });

    // Zamknij połączenie po kliknięciu guzika „Rozłącz”
    close.addEventListener("click", function (event) {
        close.disabled = true;
        send.disabled = true;
        open.disabled = false;
        message.textContent = "";
        socket.io.disconnect();
        console.dir(socket);
    });

    // Wyślij komunikat do serwera po naciśnięciu guzika „Wyślij”
    send.addEventListener("click", function (event) {
       // socket.emit('message', text.value);
        var today = new Date();
        var h = today.getHours();
        var m = today.getMinutes();
        var s = today.getSeconds();
        socket.emit('nick', h+':'+m+':'+s+' '+nick.value+" wrote: "+text.value);
        console.log('USER'+nick.value+' Wysłałem wiadomość: ' + text.value);
        text.value = "";
    });
});
