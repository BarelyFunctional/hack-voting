/*global Elm, firebase */

(function () {
    // Start the Elm App.
    var app = Elm.App.fullscreen();

    // Initialize Firebase
    var firebaseApp = firebase.initializeApp({
        apiKey: 'AIzaSyBG5-dI_sIjAC5KyQn5UEL9CLrhXwuiwgA',
        authDomain: 'voting-e6be5.firebaseapp.com',
        databaseURL: 'https://voting-e6be5.firebaseio.com',
        storageBucket: ''
    });

    // Firebase Auth.
    app.ports.authenticate.subscribe(function () {
        firebase.auth().signInAnonymously()
            .catch(app.ports.authError.send);
    });


    // Looks like this doesn't work at all if it fires before the Elm
    // app has finished initialising. But why hasn't it, by this
    // stage???
    setTimeout(function() {
        firebaseApp.auth()
            .onAuthStateChanged(app.ports.authStateChanged.send);
    }, 1);


    // Event.
    var eventPath = firebase.database().ref('/events/alpha');

    app.ports.eventListen.subscribe(function () {
        console.log('LISTENING', eventPath.toString());
        eventPath.on(
            'value',
            function(snapshot) {
                var rawValue = snapshot.val();
                console.log('HEARD', rawValue);

                app.ports.event.send(JSON.stringify(rawValue));
            },
            app.ports.eventError.send
        );
    });

    app.ports.eventSilence.subscribe(function () {
        console.log('SILENCING', eventPath.toString());
        eventPath.off('value');
    });

    // Voting.
    var votePath = eventPath.child('votes');

    app.ports.voteSend.subscribe(function (msg) {
        var uid = msg[0],
            vote = msg[1],
            path = votePath.child(uid);

        path.set(vote)
            .catch(app.ports.voteSendError.send);
    });
}());
