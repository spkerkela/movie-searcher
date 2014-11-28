// Generated by CoffeeScript 1.8.0
(function() {
  $(function() {
    var $currentMovie, $input, $results, createListElement, getMovieData, movies, searchOMDB, showMovieOnDOM;
    $input = $('#input');
    $results = $('#results');
    $currentMovie = $('#current-movie');
    searchOMDB = function(term) {
      return $.ajax({
        url: "http://www.omdbapi.com/?s=" + term
      }).promise();
    };
    getMovieData = function(clicked) {
      return $.ajax({
        url: "http://www.omdbapi.com/?i=" + clicked.currentTarget.id
      });
    };
    createListElement = function(movie) {
      return $('<li>').text("" + movie.Title + " (" + movie.Type + ")").attr('class', 'result-item').attr('id', movie.imdbID).append($('<a>').text(' link').attr('href', "http://www.imdb.com/title/" + movie.imdbID));
    };
    showMovieOnDOM = function(movie) {
      var createULElement;
      createULElement = function(title, list) {
        return ($('<h3>').text(title)).append($('<ul>').attr('class', 'no-bullet').append($.map(list, function(elem) {
          return $('<li>').text(elem);
        })));
      };
      return $currentMovie.empty().append($('<h2>').text("" + movie.Title + " (" + movie.Year + ")")).append($('<h3>').text('Plot')).append($('<p>').text(movie.Plot)).append(createULElement('Writers', movie.Writer.split(', '))).append(createULElement('Directors', movie.Director.split(', '))).append(createULElement('Actors', movie.Actors.split(', '))).append(createULElement('Genre', movie.Genre.split(', '))).append($('<p>').text("IMDB Rating with " + movie.imdbVotes + ": " + movie.imdbRating));
    };
    movies = Rx.Observable.fromEvent($input, 'keyup').map(function(e) {
      return e.target.value;
    }).filter(function(text) {
      return text.length > 2;
    }).debounce(500).distinctUntilChanged().flatMapLatest(searchOMDB);
    return movies.subscribe(function(data) {
      var $resultItems, clicks, parsed;
      console.log(JSON.parse(data));
      parsed = JSON.parse(data);
      if (parsed.Response === 'False') {
        return $results.empty().append($('<li>').text("No results found."));
      } else {
        $results.empty().append($.map(parsed.Search, function(movie) {
          return createListElement(movie);
        }));
        $resultItems = $('.result-item');
        clicks = Rx.Observable.fromEvent($resultItems, 'click');
        return clicks.flatMapLatest(getMovieData).subscribe(function(data) {
          var movie;
          movie = JSON.parse(data);
          console.log(movie);
          return showMovieOnDOM(movie);
        }, function(error) {
          return console.log(error);
        });
      }
    }, function(error) {
      $results.empty().append($('<li>').text("Error calling OMDB: " + error));
      return clicks.dispose();
    });
  }).foundation();

}).call(this);