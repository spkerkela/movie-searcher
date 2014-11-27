$(function(){
  var $input = $('#input'),
      $results = $('#results'),
      $currentMovie = $('#current-movie'),
      $resultItems,
      clicks;

  /*== STREAM CREATION ==*/

  /* Observe keyUp events */
  var keyups = Rx.Observable.fromEvent($input, 'keyup')
    .map(function (e) {
      return e.target.value;
    })
    .filter(function (text) {
      return text.length > 2; // only search for words that have more than 2 letters
    });

  var debounced = keyups
    .debounce(500); /* Add a small latency of 500ms */

  /* Now get only distinct values, so we eliminate the arrows and other control characters */
  var distinct = debounced
    .distinctUntilChanged();

  /*== HELPERS ==*/

  /* Ajax functions */
  function searchOMDB(term) {
    return $.ajax({
      url: 'http://www.omdbapi.com/?s='+term
    }).promise();
  }

  function getMovieData(clicked) {
    return $.ajax({
      url: 'http://www.omdbapi.com/?i=' + clicked.currentTarget.id
    }).promise();
  }

  /* DOM modification functions */
  function createListElement(movie) {
    return $('<li>').text(movie.Title+' (' + movie.Type + ') ')
      .attr('class', 'result-item')
      .attr('id', movie.imdbID)
      .append($('<a>')
        .text('link')
        .attr('href', 'http://www.imdb.com/title/' + movie.imdbID));
  }

  function showMovieOnDOM(movie) {

    function createULElement(title, list) {
      return ($('<h3>').text(title))
        .append($('<ul>')
          .attr('class', 'no-bullet')
          .append($.map(list,
            function (element) {
              return $('<li>').text(element);
            })));
    }

    $currentMovie
      .empty()
      .append($('<h2>').text(movie.Title + ' (' + movie.Year + ')'))
      .append($('<h3>').text('Plot'))
      .append($('<p>').text(movie.Plot))
      .append(createULElement('Writers', movie.Writer.split(', ')))
      .append(createULElement('Directors', movie.Director.split(', ')))
      .append(createULElement('Actors', movie.Actors.split(', ')))
      .append(createULElement('Genre', movie.Genre.split(', ')))
      .append($('<p>').text('IMDB Rating with ' + movie.imdbVotes + ' votes: ' + movie.imdbRating));
  }

  var movies = distinct
    .flatMapLatest(searchOMDB);

  movies.subscribe(
    function (data) {
      console.log(JSON.parse(data));
      var parsed = JSON.parse(data);

      if(parsed.Response === 'False') {
        $('#results')
        .empty()
        .append($('<li>').text("No results found."))
      } else {
        $('#results')
          .empty()
          .append ($.map(parsed.Search, function (movie) {
            return createListElement(movie);
          }));

        $resultItems = $('.result-item');
        clicks = Rx.Observable.fromEvent($resultItems, 'click');

        clicks
          .flatMapLatest(getMovieData)
          .subscribe(
          function (data) {
            var movie = JSON.parse(data);
            console.log(movie);
            showMovieOnDOM(movie);
          },
          function (error) {
            console.log(error);
          });
      }
    },
    function (error) {
      $results.empty().append($('<li>').text('Error calling OMDB:' + error));
      clicks.dispose();
    });
}).foundation();
