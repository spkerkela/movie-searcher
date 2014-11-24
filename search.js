$(function(){
  var $input = $('#input'),
      $results = $('#results');

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

  function searchOMDB(term) {
    return $.ajax({
      url: 'http://www.omdbapi.com/?s='+term
    }).promise();
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
        .append ($.map(parsed.Search, function (value) {
          return $('<li>').text(value.Title+' (' + value.Type + ') ')
            .append($('<a>')
              .text("link")
              .attr("href", "http://www.imdb.com/title/"+value.imdbID));
        }));
      }
    },
    function (error) {
      $results.empty().append($('<li>').text('Error calling OMDB:' + error));
    });

});
