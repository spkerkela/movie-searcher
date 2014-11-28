$(() ->
  $input = $('#input')
  $results = $('#results')
  $currentMovie = $('#current-movie')

  # Ajax functions

  searchOMDB = (term) ->
    $.ajax({url: "http://www.omdbapi.com/?s=#{term}"}).promise()

  getMovieData = (clicked) ->
    $.ajax({url: "http://www.omdbapi.com/?i=#{clicked.currentTarget.id}"})

  # DOM modifying functions

  createListElement = (movie) ->
    $('<li>').text("#{movie.Title} (#{movie.Type})")
      .attr('class', 'result-item')
      .attr('id', movie.imdbID)
      .append($('<a>')
        .text(' link')
        .attr('href', "http://www.imdb.com/title/#{movie.imdbID}"))

  showMovieOnDOM = (movie) ->

    createULElement = (title, list) ->
      ($('<h3>').text(title))
        .append($('<ul>')
          .attr('class', 'no-bullet')
          .append($.map(list, (elem) ->
            $('<li>').text(elem))))

    $currentMovie
      .empty()
      .append($('<h2>').text("#{movie.Title} (#{movie.Year})"))
      .append($('<h3>').text('Plot'))
      .append($('<p>').text(movie.Plot))
      .append(createULElement('Writers', movie.Writer.split(', ')))
      .append(createULElement('Directors', movie.Director.split(', ')))
      .append(createULElement('Actors', movie.Actors.split(', ')))
      .append(createULElement('Genre', movie.Genre.split(', ')))
      .append($('<p>').text("IMDB Rating with #{movie.imdbVotes}: #{movie.imdbRating}"))

  movies = Rx.Observable.fromEvent($input, 'keyup')
    .map((e) -> e.target.value)
    .filter((text) -> text.length > 2)
    .debounce(500)
    .distinctUntilChanged()
    .flatMapLatest(searchOMDB)

  movies.subscribe(
    (data) ->
      console.log(JSON.parse(data))
      parsed = JSON.parse(data)
      if parsed.Response is 'False'
        $results
          .empty()
          .append($('<li>').text("No results found."))
      else
        $results
          .empty()
          .append($.map(parsed.Search, (movie) ->
              createListElement(movie)
            ))

        $resultItems = $('.result-item')
        clicks = Rx.Observable.fromEvent($resultItems, 'click')

        clicks
          .flatMapLatest(getMovieData)
          .subscribe(
            (data) ->
              movie = JSON.parse(data)
              console.log(movie)
              showMovieOnDOM(movie)

            (error) ->
              console.log(error))
    (error) ->
      $results
        .empty()
        .append($('<li>').text("Error calling OMDB: #{error}"))
      clicks.dispose())
).foundation()
