
var imageUrl = function(name, size){
  return 'http://image.tmdb.org/t/p/' + size + name;
}

var lazyLoadImage = function(url){
  $('#movie-backdrop').css("width","50px").attr("src",'images/loading.gif');
    var img = new Image();
    $(img).load(function() {
      $('#movie-backdrop').css("width","100%").attr("src",img.src);
    });
    img.src = url ? imageUrl(url, 'w780') : 'http://placehold.it/400x225';
}

var fetchMovies = function(){
  $.mobile.loading("show",{
    text: "Loading"
  });

  $.ajax({
      url: 'http://moviebuddy.info:4000/movies', // The URL to the API. You can get this by clicking on "Show CURL example" from an API profile
      type: 'GET', // The HTTP Method
      data: {}, // Additional parameters here
      datatype: 'json',
      success: function(data){
        $ul = $('ul#movies');

        data.forEach(function(movie){
          $ul.append('<li>'+
                        '<a href="#page2" movie-id="'+ movie.id +'" class="movie-item" data-transition="slide">'+
                          '<img src="'+ imageUrl(movie.poster, 'w92') +'">'+
                          '<h2>'+ movie.title +'</h2>'+
                          '<p>'+ movie.description +'</p>'+
                          '</a>'+
                      '</li>');
        });

        // update layout
        $ul.listview( "refresh" );

        // hide loader
        $.mobile.loading("hide");
      },
      error: function(err){
        $.mobile.loading("hide");
        $('.ui-content').first().html("<p>An unexpected error occured</p>");
      }
  });
  
}

var showTimes = function(id, cinemas){
  $div = $('#'+id);
  cinemas.forEach(function(show){
    $div.append('<li>'+ show.time +'</li>')
  })
}

var requestCinemas = function(id){
  // remove previously appended cinemas
  $('#cinemas').html("");
  
  $.mobile.loading("show",{
    text: "Loading"
  });

  $.ajax({
      url: "http://moviebuddy.info:4000/movies/"+ id + "/cinemas", // The URL to the API. You can get this by clicking on "Show CURL example" from an API profile
      type: 'GET', // The HTTP Method
      data: {}, // Additional parameters here
      datatype: 'json',
      success: function(data){
        $ul = $('#cinemas');
        data.forEach(function(cinema){
          $ul.append('<li data-role="list-divider">'+ cinema.name +'<span class="ui-li-count">'+ cinema.show_times.length+'</span></li>'+
                      '<li>'+
                        '<h2>Show Times</h2>'+
                        '<ol data-role="listview" id="'+ cinema.id +'" ></ol>'+
                      '</li>');
          showTimes(cinema.id, cinema.show_times);
        })
        // update layout
        $ul.listview( "refresh" );

        // hide loader
        $.mobile.loading("hide");
      }
  });
}


$(document).on('ready', function(){
  fetchMovies();
});

$(document).on("click", "a.movie-item", function() { 

  var id = $(this).attr('movie-id');

  //load default image
  $('#movie-backdrop').attr('src', '');

  $.ajax({
      url: "http://moviebuddy.info:4000/movies/"+ id,
      type: 'GET', // The HTTP Method
      data: {}, // Additional parameters here
      datatype: 'json',
      success: function(data){
        $('#movie-title').text(data.title);
        $('#movie-description').text(data.description);
        if(data.youtube){
          $('iframe').attr('src', 'http://www.youtube.com/embed/'+ data.youtube);
        }
        else{
          $('#popupVideo').html("<p>Trailer not found :-(</p>");
        }
      
        lazyLoadImage(data.backdrop);
        requestCinemas(data.id);

      }
  });


});


// popups
$( document ).on( "pagecreate", function() {
    // The window width and height are decreased by 30 to take the tolerance of 15 pixels at each side into account
    function scale( width, height, padding, border ) {
        var scrWidth = $( window ).width() - 30,
            scrHeight = $( window ).height() - 30,
            ifrPadding = 2 * padding,
            ifrBorder = 2 * border,
            ifrWidth = width + ifrPadding + ifrBorder,
            ifrHeight = height + ifrPadding + ifrBorder,
            h, w;
        if ( ifrWidth < scrWidth && ifrHeight < scrHeight ) {
            w = ifrWidth;
            h = ifrHeight;
        } else if ( ( ifrWidth / scrWidth ) > ( ifrHeight / scrHeight ) ) {
            w = scrWidth;
            h = ( scrWidth / ifrWidth ) * ifrHeight;
        } else {
            h = scrHeight;
            w = ( scrHeight / ifrHeight ) * ifrWidth;
        }
        return {
            'width': w - ( ifrPadding + ifrBorder ),
            'height': h - ( ifrPadding + ifrBorder )
        };
    };
    $( ".ui-popup iframe" )
        .attr( "width", 0 )
        .attr( "height", "auto" );
    $( "#popupVideo" ).on({
        popupbeforeposition: function() {
            // call our custom function scale() to get the width and height
            var size = scale( 497, 298, 15, 1 ),
                w = size.width,
                h = size.height;
            $( "#popupVideo iframe" )
                .attr( "width", w )
                .attr( "height", h );
        },
        popupafterclose: function() {
            $( "#popupVideo iframe" )
                .attr( "width", 0 )
                .attr( "height", 0 );
        }
    });
});