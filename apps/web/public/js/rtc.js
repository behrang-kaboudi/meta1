var myConn;
var stream;
var mainCall;
setupConnection ();
$ (document).ready (function () {
  socket.on ('offer', function (call) {
    mainCall = call;
    setupConnection ();
    acceptCall (call);
  });
  socket.on ('callAnswer', function (call) {
    mainCall = call;
    myConn.setRemoteDescription (new RTCSessionDescription (call.answer));
    // console.log (call);
  });
});
function setMedia () {
  navigator.getUserMedia (
    {video: true, audio: false},
    function (s) {
      stream = s;
      var video = document.querySelector ('video');

      //insert s into the video tag
      video.srcObject = s;
      myConn.addStream (s);
    },
    function (err) {}
  );
}
function setupConnection () {
  var configuration = {
    iceServers: [
      {
        url: 'stun:stun2.1.google.com:19302',
      },
    ],
  };

  myConn = new webkitRTCPeerConnection (configuration, {
    optional: [
      {
        RtpDataChannels: true,
      },
    ],
  });

  myConn.onicecandidate = function (event) {
    mainCall.ice = event.candidate;
    mainCall.sender = userName;
    console.log ('event');
    // event.candidate
    if (event.candidate) {
      socket.emit ('iceCandidate', mainCall);
    }
  };
  myConn.onaddstream = function (e) {
    document.querySelector ('video').src = window.URL.createObjectURL (
      e.stream
    );
  };
}
function sendOffer (calee) {
  //   setupConnection ();
  setMedia ();
  myConn.createOffer (
    function (offer) {
      let call = {
        caller: userName,
        callee: 'beh2',
        offer: offer,
      };
      socket.emit ('callOffer', call);
      myConn.setLocalDescription (offer);
    },
    function (error) {
      //   alert ('Offer has not created');
    }
  );
}
function stopStream () {
  const tracks = stream.getTracks ();
  stream.enabled = false;
  tracks.forEach (function (track) {
    track.stop ();
  });
  document.querySelector ('video').srcObject = null;
}
function acceptCall (call) {
  myConn.setRemoteDescription (new RTCSessionDescription (call.offer));
  myConn.createAnswer (
    function (answer) {
      myConn.setLocalDescription (answer);
      call.answer = answer;
      socket.emit ('callAccepted', call);
    },
    function (error) {
      alert ('Answer has not created');
    }
  );
}
