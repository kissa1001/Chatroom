$(document).ready(function() {

    var socket = io();
    var input = $('.msgInput');
    var nickInput = $('.usernameInput');
    var loginPage = $('.login-form'); 
    var chatPage = $('.wrapper'); 
    var messages = $('#messages');
    var usersDiv = $('#usersDiv');
    var addMessage = function(message) {
        messages.append('<div>' + message + '</div>');
    };

    //Create username
    socket.on('connect', function(data){
        function setUsername () {
            nickname = nickInput.val();
            // If the username is valid
            if (nickname) {
                loginPage.fadeOut();
                socket.emit('join', nickname);
                chatPage.show();
            }
        }     
        nickInput.on('keydown',function (event) {
            // When the client hits ENTER on their keyboard
            if (event.which === 13) {
                setUsername();
            }
        });
    });
    socket.on('usernames', function(name){
        var html = '';
        for(var i=0; i < name.length; i++){
            html += name[i] + '<br/>'
        }
        usersDiv.html(html);
    });
    //User is typing
    $("input").on("keyup", function (event) {
        socket.emit("sender", {
            nickname: nickname
        });
    });
    socket.on("sender", function (data) {
        $("#status").html(data.nickname + " is typing");
        setTimeout(function () {
            $("#status").html('');
        }, 3000);
    });
    //Loading old msgs
    socket.on('load old msgs', function(data){
        for(var i=data.length-1; i >= 0 ; i--){
            console.log(data[i]);
            if(nickname != data[i].userName){
                messages.append('<div class="user">' + data[i].userName + ': ' + data[i].msg + '</div>');
            }
            else{
                messages.append('<div class="me"> Me: ' + data[i].msg + '</div>');
            }
        };
    });
    //Setting username
    
    //Sending message
    input.on('keydown', function(event) {
        if (event.keyCode != 13) {
            return;
        }

        var message = input.val();
        socket.emit('message', message);
        input.val('');
    });
    socket.on('message', addMessage);
});
