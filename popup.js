var cinemaplexApp = {
    imageUrl: function (name, size) {
        return 'http://image.tmdb.org/t/p/' + size + name;
    },

    resetImage: function () {
        $('#movie-backdrop').css("width", "30px").attr("src", 'images/loading.gif');
    },

    resetView: function () {
        $('#cinemas').html("");
        $('#movie-title').text("");
        $('#movie-description').text("");
        $('#movie-backdrop').attr('src', '');
    },

    lazyLoadImage: function (url) {
        cinemaplexApp.resetImage();

        var img = new Image();
        $(img).load(function () {
            $('#movie-backdrop').css("width", "100%").attr("src", img.src);
        });
        img.src = url ? cinemaplexApp.imageUrl(url, 'w780') : 'http://placehold.it/400x225';
    },

    showTimes: function (id, cinemas) {
        $div = $('#' + id);
        cinemas.forEach(function (show) {
            $div.append('<li>' + show.time + '</li>')
        })
    },

    renderMovies: function (data) {
        $ul = $('ul#movies');
        data.forEach(function (movie) {
            $ul.append('<li>' +
                '<a href="#page2" movie-id="' + movie.id + '" class="movie-item" data-transition="slide">' +
                '<img src="' + cinemaplexApp.imageUrl(movie.poster, 'w92') + '">' +
                '<h2>' + movie.title + '</h2>' +
                '<p>' + movie.description + '</p>' +
                '</a>' +
                '</li>');
        });
        // update layout
        $ul.listview("refresh");

        // hide loader
        $.mobile.loading("hide");

    },

    showError: function (error) {
        $.mobile.loading("hide");
        $('.ui-content').first().html("<p>An unexpected error occured</p>");
    },

    showLoading: function () {
        $.mobile.loading("show", {
            text: "Loading"
        });
    },

    fetchMovies: function () {
        cinemaplexApp.showLoading();

        $.ajax({
            url: 'http://moviebuddy.info/api/movies',
            type: 'GET',
            datatype: 'json',
            success: function (data) {
                cinemaplexApp.renderMovies(data);
            },
            error: function (err) {
                cinemaplexApp.showError(err);
            }
        });
    },

    renderCinemas: function (data) {
        $ul = $('#cinemas');
        data.forEach(function (cinema) {
            $ul.append('<li data-role="list-divider">' + cinema.name + '<span class="ui-li-count">' + cinema.show_times.length + '</span></li>' +
                '<li>' +
                '<h2>Show Times</h2>' +
                '<ol data-role="listview" id="' + cinema.id + '" ></ol>' +
                '</li>');
            cinemaplexApp.showTimes(cinema.id, cinema.show_times);
        });
        // update layout
        $ul.listview("refresh");

        // hide loader
        $.mobile.loading("hide");
    },

    requestCinemas: function (id) {
        cinemaplexApp.showLoading();

        $.ajax({
            url: "http://moviebuddy.info/api/movies/" + id + "/cinemas",
            type: 'GET', // The HTTP Method
            data: {}, // Additional parameters here
            datatype: 'json',
            success: function (data) {
                cinemaplexApp.renderCinemas(data);
            }
        });
    },

    renderMovieDetails: function (data) {
        $('#movie-title').text(data.title);
        $('#movie-description').text(data.description);

        if (data.youtube) {
            $('iframe').attr('src', 'http://www.youtube.com/embed/' + data.youtube);
        } else {
            $('#popupVideo').html("<p>Trailer not found :-(</p>");
        }

        cinemaplexApp.lazyLoadImage(data.backdrop);
        cinemaplexApp.requestCinemas(data.id);
    },

    showMovie: function (element) {
        var id = element.attr('movie-id');

        $.ajax({
            url: "http://moviebuddy.info/api/movies/" + id,
            type: 'GET',
            datatype: 'json',
            success: function (data) {
                cinemaplexApp.renderMovieDetails(data);
            }
        });
    }

};

var popupVideo = {
    /* The window width and height are decreased by 30 to
     * take the tolerance of 15 pixels at each side into account */
    scale: function (width, height, padding, border) {
        var scrWidth = $(window).width() - 30,
            scrHeight = $(window).height() - 30,
            ifrPadding = 2 * padding,
            ifrBorder = 2 * border,
            ifrWidth = width + ifrPadding + ifrBorder,
            ifrHeight = height + ifrPadding + ifrBorder,
            h, w;

        if (ifrWidth < scrWidth && ifrHeight < scrHeight) {
            w = ifrWidth;
            h = ifrHeight;
        } else if ((ifrWidth / scrWidth) > (ifrHeight / scrHeight)) {
            w = scrWidth;
            h = (scrWidth / ifrWidth) * ifrHeight;
        } else {
            h = scrHeight;
            w = (scrHeight / ifrHeight) * ifrWidth;
        }
        return {
            'width': w - (ifrPadding + ifrBorder),
            'height': h - (ifrPadding + ifrBorder)
        };

    }
};


$(document).on('ready', function () {
    cinemaplexApp.fetchMovies();
});

$(document).on("click", "a.movie-item", function () {
    var element = $(this);
    cinemaplexApp.resetView();
    cinemaplexApp.showMovie(element);
});


// popups
$(document).on("pagecreate", function () {
    $(".ui-popup iframe").attr("width", 0).attr("height", "auto");
    $("#popupVideo").on({
        popupbeforeposition: function () {
            // call our custom function scale() to get the width and height
            var size = popupVideo.scale(497, 298, 15, 1),
                w = size.width,
                h = size.height;
            $("#popupVideo iframe").attr("width", w).attr("height", h);
        },
        popupafterclose: function () {
            $("#popupVideo iframe").attr("width", 0).attr("height", 0);
        }
    });
});