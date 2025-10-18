
$(document).ready(function () {
  // --- VARIABLES ---
  var container = $("#pokemon-container");
  var nextBtn = $("#next");
  var prevBtn = $("#prev");
  var searchInput = $("input[type='text']");
  var searchBtn = $("button.btn-secondary");

  var currentPage = 0;
  var limit = 16;
  var totalCount = 0;

  // --- FUNCIONES ---

  // Cargar Pokémon 
  function loadPokemons(offset) {
    container.empty();

    $.get("https://pokeapi.co/api/v2/pokemon", { limit: limit, offset: offset }, function (data) {
      totalCount = data.count;
      $.each(data.results, function (i, pokemon) {
        $.get(pokemon.url, function (pokeData) {
          showPokemonCard(pokeData);
        });
      });
    }).fail(function () {
      container.html("<p class='text-center text-light mt-4'>Error al cargar los Pokémon.</p>");
    });
  }

  // Mostrar Pokémon como tarjeta
  function showPokemonCard(pokemon) {
    var card = `
      <div class="col-6 col-md-4 col-lg-3">
        <div class="card text-center border-dark pokemon-card" data-id="${pokemon.id}">
          <img src="${pokemon.sprites.other['official-artwork'].front_default}" class="card-img-top bg-light p-2" alt="${pokemon.name}">
          <div class="card-body">
            <h5 class="card-title text-capitalize fw-bold">${pokemon.name}</h5>
            <p class="card-text text-secondary">#${pokemon.id}</p>
          </div>
        </div>
      </div>
    `;
    container.append(card);
  }

  // Mostrar vista detallada de un Pokémon
  function showPokemonDetails(pokemon) {
    container.empty();

    var types = pokemon.types.map(t => t.type.name).join(", ");
    var abilities = pokemon.abilities.map(a => a.ability.name).join(", ");

    var details = `
      <div class="col-12 text-center text-light">
        <div class="card mx-auto border-dark" style="max-width: 400px; background-color:white;">
          <img src="${pokemon.sprites.other['official-artwork'].front_default}" 
               class="card-img-top p-3" alt="${pokemon.name}">
          <div class="card-body">
            <h3 class="text-capitalize fw-bold">${pokemon.name}</h3>
            <p class="text-secondary">ID: #${pokemon.id}</p>
            <p><strong>Type:</strong> ${types}</p>
            <p><strong>Height:</strong> ${pokemon.height / 10 } m</p>
            <p><strong>Weight:</strong> ${pokemon.weight / 10} kg</p>
            <p><strong>Abilities:</strong> ${abilities}</p>
            <button id="back-btn" class="btn btn-dark mt-3">Return</button>
          </div>
        </div>
      </div>
    `;
    container.html(details);
  }

  // -------------------- EVENTOS --------------------

  // Paginación siguiente
  nextBtn.on("click", function () {
    currentPage++;
    var totalPages = Math.ceil(totalCount / limit);
    if (currentPage >= totalPages) currentPage = 0; // Wrap-around
    loadPokemons(currentPage * limit);
  });

  // Paginación anterior (con wrap-around)
  prevBtn.on("click", function () {
    var totalPages = Math.ceil(totalCount / limit);
    if (currentPage <= 0) currentPage = totalPages - 1;
    else currentPage--;
    loadPokemons(currentPage * limit);
  });

  // Buscar Pokémon por nombre o ID
  searchBtn.on("click", function () {
    var query = searchInput.val().trim().toLowerCase();
    if (query === "") {
      loadPokemons(currentPage * limit);
      return;
    }

    container.empty();
    $.get("https://pokeapi.co/api/v2/pokemon/" + query, function (data) {
      showPokemonDetails(data);
    }).fail(function () {
      container.html("<p class='text-center text-light mt-4'>Pokémon no encontrado.</p>");
    });
  });

  // Permitir Enter para buscar
  searchInput.on("keydown", function (e) {
    if (e.key === "Enter") searchBtn.trigger("click");
  });

  // Mostrar detalles al hacer clic en una carta
  container.on("click", ".pokemon-card", function () {
    var id = $(this).data("id");
    $.get("https://pokeapi.co/api/v2/pokemon/" + id, function (data) {
      showPokemonDetails(data);
    });
  });

  // Regresar al listado
  container.on("click", "#back-btn", function () {
    loadPokemons(currentPage * limit);
  });

  // --- Cargar al inicio ---
  loadPokemons(0);
});
