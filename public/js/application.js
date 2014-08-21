// --------------- VIEW ---------------
function View() {
  this.options = {
    auto_play: true,
    buying: false,
    liking: true,
    download: false,
    sharing: true,
    show_artwork: true,
    show_comments: true,
    show_playcount: true,
    show_user: true,
    hide_related: true,
    visual: true,
    start_track: 0
  };
}

View.prototype = {
  constructor: View,
  initializeWidget: function(track) {
    var srcRoot = "https://w.soundcloud.com/player/?url=";
    $('<iframe/>', {
      id: 'scWidget',
      width: '500',
      height: '465',
      scrolling: 'no',
      frameborder: 'no',
      src: srcRoot + track.sc_uri
    }).appendTo('div.player');
    this.scWidget = SC.Widget($('#scWidget').get(0));
    this.scWidget.load(track.sc_uri, this.options);
  },
  loadTrack: function(track) {
    this.scWidget.load(track.sc_uri, this.options);
    // this.updateNowPlaying(track);
  },
  renderTrackLink: function(element, index) {
    var li = $('<li/>');
    var trackLink = $('<a/>', {
      href: element.sc_uri,
      id: index,
      text: element.artist + ' | ' + element.title
    });
    li.append(trackLink);
    $('.tracklist').append(li);
  }//,
  // updateNowPlaying: function(track) {
  //   $('.tracklist li #' + tr)
  // }
};

// ------------ CONTROLLER ------------
function Controller(view, playlist) {
  this.view = view;
  this.playlist = playlist;
  this.tracks = playlist.tracks;
  this.currentTrackNum = 0;
}

Controller.prototype = {
  constructor: Controller,
  initialize: function() {
    this.view.initializeWidget(this.tracks[this.currentTrackNum]);
    this.createTrackLinks();
    this.addEventHandlers();
  },
  addEventHandlers: function() {
    var ctrlr = this;
    $('.controls #prev').click(function(e){
      e.preventDefault();
      ctrlr.prev();
    });
    $('.controls #next').click(function(e){
      e.preventDefault();
      ctrlr.next();
    });
    $('.tracklist a').click(function(e){
      e.preventDefault();
      ctrlr.playTrack(parseInt($(this).attr('id'), 10));
    });
  },
  createTrackLinks: function() {
    this.tracks.forEach(this.view.renderTrackLink);
  },
  playTrack: function (trackNum) {
    this.currentTrackNum = trackNum;
    this.view.loadTrack(this.tracks[this.currentTrackNum]);
  },
  next: function() {
    this.playTrack(this.currentTrackNum + 1);
  },
  prev: function() {
    this.playTrack(this.currentTrackNum - 1);
  }
};

// TODO: Remove global test vars
var controller;
var playlist, tracks;

$(document).ready(function() {
  getPlaylist(14);
});

function getPlaylist(id) {
  $.getJSON('/playlists/'+id, function(response){
    playlist = response;
    controller = new Controller(new View(), playlist);
    controller.initialize();
  });
}

// function Track(obj) {
//   $.extend(this, obj);
// }

// Track.prototype = {
//   constructor: Track,

// };

// function Playlist(name) {
//   this.name = name;
// }

// Playlist.prototype = {
//   constructor: Playlist,

// };