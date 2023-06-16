const homeButton = document.querySelector("#home-button");
const searchBox = document.querySelector("#search-box");
const goToFavouriteButton = document.querySelector("#goto-favourites-button");
const movieCardContainer = document.querySelector("#movie-card-container");

let currentMovieStack = [];

// simple function to show an alert when needed
const showAlert = (message) => {
	alert(message);
};

// create movie cards using elements of currentMovieStack array
const renderList = (actionForButton) => {
	movieCardContainer.innerHTML = '';

	currentMovieStack.forEach((movie) => {
		const movieCard = document.createElement('div');
		movieCard.classList.add("movie-card");

		const movieHTML = `
			<img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" class="movie-poster">
			<div class="movie-title-container">
				<span>${movie.title}</span>
				<div class="rating-container">
					<img src="./res/rating-icon.png" alt="">
					<span>${movie.vote_average}</span>
				</div>
			</div>
			<button id="${movie.id}" onclick="getMovieInDetail(this)" style="height:40px;"> Movie Details </button>
			<button onclick="${actionForButton}(this)" class="add-to-favourite-button text-icon-button" data-id="${movie.id}">
				<img src="./res/favourites-icon.png">
				<span>${actionForButton}</span>
			</button>
		`;

		movieCard.innerHTML = movieHTML;
		movieCardContainer.append(movieCard);
	});
};

// if anything goes wrong, display an error message
const printError = (message) => {
	const errorDiv = document.createElement("div");
	errorDiv.innerHTML = message;
	errorDiv.style.height = "100%";
	errorDiv.style.fontSize = "5rem";
	errorDiv.style.margin = "auto";
	movieCardContainer.innerHTML = "";
	movieCardContainer.append(errorDiv);
};

// fetch trending movies from the server and render them as movie cards
const getTrandingMovies = async () => {
	try {
		const response = await fetch("https://api.themoviedb.org/3/trending/movie/day?api_key=cb213741fa9662c69add38c5a59c0110");
		const data = await response.json();
		currentMovieStack = data.results;
		renderList("favourite");
	} catch (err) {
		printError(err);
	}
};

getTrandingMovies();

// when the home button is clicked, fetch trending movies and render them on the web page
homeButton.addEventListener('click', getTrandingMovies);

// search box event listener checks for any key press and searches the movie accordingly and shows it on the web page
searchBox.addEventListener('keyup', async () => {
	const searchString = searchBox.value;

	if (searchString.length > 0) {
		const searchStringURI = encodeURI(searchString);
		try {
			const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=cb213741fa9662c69add38c5a59c0110&language=en-US&page=1&include_adult=false&query=${searchStringURI}`);
			const data = await response.json();
			currentMovieStack = data.results;
			renderList("favourite");
		} catch (err) {
			printError(err);
		}
	}
});

// function to add a movie to the favourite section
const favourite = (element) => {
	const id = element.dataset.id;
	const movie = currentMovieStack.find((movie) => {
		return movie.id == id;
	  });
	
	  if (movie) {
		let favouriteMoviesAkash = JSON.parse(localStorage.getItem("favouriteMoviesAkash"));
	
		if (favouriteMoviesAkash === null) {
		  favouriteMoviesAkash = [];
		}
	
		favouriteMoviesAkash.unshift(movie);
		localStorage.setItem("favouriteMoviesAkash", JSON.stringify(favouriteMoviesAkash));
	
		showAlert(movie.title + " added to favourites");
	  }
	};
	
	// When the "Favourites" button is clicked, it shows the favourite movies
	goToFavouriteButton.addEventListener('click', () => {
	  let favouriteMoviesAkash = JSON.parse(localStorage.getItem("favouriteMoviesAkash"));
	  if (favouriteMoviesAkash === null || favouriteMoviesAkash.length < 1) {
		showAlert("You have not added any movie to favourites");
		return;
	  }
	
	  currentMovieStack = favouriteMoviesAkash;
	  renderList("remove");
	});
	
	// Remove movies from the favourite section
	const remove = (element) => {
	  const id = element.dataset.id;
	  let favouriteMoviesAkash = JSON.parse(localStorage.getItem("favouriteMoviesAkash"));
	  let newFavouriteMovies = favouriteMoviesAkash.filter((movie) => movie.id !== id);
	
	  localStorage.setItem("favouriteMoviesAkash", JSON.stringify(newFavouriteMovies));
	  currentMovieStack = newFavouriteMovies;
	  renderList("remove");
	};
	
	// Renders movie details on the web page
	const renderMovieInDetail = (movie) => {
	  console.log(movie);
	  movieCardContainer.innerHTML = '';
	
	  let movieDetailCard = document.createElement('div');
	  movieDetailCard.classList.add('detail-movie-card');
	
	  movieDetailCard.innerHTML = `
		<img src="https://image.tmdb.org/t/p/w500${movie.backdrop_path}" class="detail-movie-background">
		<img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" class="detail-movie-poster">
		<div class="detail-movie-title">
		  <span>${movie.title}</span>
		  <div class="detail-movie-rating">
			<img src="./res/rating-icon.png">
			<span>${movie.vote_average}</span>
		  </div>
		</div>
		<div class="detail-movie-plot">
		  <p>${movie.overview}</p>
		  <p>Release date: ${movie.release_date}</p>
		  <p>Runtime: ${movie.runtime} minutes</p>
		  <p>Tagline: ${movie.tagline}</p>
		</div>
	  `;
	
	  movieCardContainer.append(movieDetailCard);
	};
	
	// Fetches the details of a movie and sends it to renderMovieInDetail to display
	const getMovieInDetail = (element) => {
	  const movieId = element.getAttribute('id');
	  fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=cb213741fa9662c69add38c5a59c0110&language=en-US`)
		.then((response) => response.json())
		.then((data) => renderMovieInDetail(data))
		.catch((err) => printError(err));
	};
	