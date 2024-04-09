let state = 'askingCity';
let city, sexe, saison;

document.getElementById('user-input').addEventListener('keyup', function(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        sendMessage();
    }
});

function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value;
    userInput.value = '';

    if (state === 'askingCity') {
        city = message;
        addMessageToChatBox(`Vous avez choisi la ville : ${city}`);
        addMessageToChatBox('Quel est votre sexe ? (0: Femme, 1: Homme)');
        state = 'askingSexe';
    } else if (state === 'askingSexe') {
        sexe = message;
        addMessageToChatBox(`Vous avez choisi : ${sexe}`);
        addMessageToChatBox('Quelle est la saison ? (1: printemps / 2: été / 3: automne / 4: hiver)');
        state = 'askingSaison';
    } else if (state === 'askingSaison') {
        saison = message;
        addMessageToChatBox(`Vous avez choisi : ${saison}`);
        state = 'done';

        sendQuestionnaire(city, sexe, saison);
    }

    // Set the focus back to the text input field
    userInput.focus();
}

var startDelay = 0;
var messageCount = 0;
var baseDelay = 500;

function addMessageToChatBox(message) {
    // Create a new div for the message
    var messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', 'bot-message');
    document.getElementById('chat-box').appendChild(messageDiv);
  
    // Create a new Typed instance for the message
    var options = {
      strings: [message],
      typeSpeed: 15,
      startDelay: startDelay,
      showCursor: false
    };
    var typed = new Typed(messageDiv, options);
  
    // Increase the message count
    messageCount++;
  
    // If this is the second message, reset the start delay and the message count
    if (messageCount === 2) {
      startDelay = 0;
      messageCount = 0;
    } else {
      // Otherwise, increase the start delay for the next message
      startDelay += message.length * options.typeSpeed + baseDelay;
    }
}

function appendMessage(sender, message) {
  var chatBox = document.getElementById("chat-box");
  var messageElement = document.createElement("div");
  messageElement.classList.add("chat-message");

  if (sender === 'user') {
    messageElement.classList.add("user-message");
  } else if (sender === 'bot') {
    messageElement.classList.add("bot-message");
  }

  messageElement.innerText = message;
  chatBox.appendChild(messageElement);
}

function getWeather() {
    navigator.geolocation.getCurrentPosition(function(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;

        fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=db63742015484084bca52473d6341c10`)
        .then(response => response.json())
        .then(data => {
            var city = data.results[0].components.city;

            fetch(`http://localhost:5000/weather`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "city": city })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error(data.error);
                } else {
                    console.log(data.weather);
                    console.log(city);
                    document.getElementById('weather').innerText = data.weather;
                    document.getElementById('location').innerText = city;         
                }
            })
            .catch(error => console.error('Erreur:', error));
        })
        .catch(error => console.error('Erreur:', error));
    });
}

document.addEventListener('DOMContentLoaded', getWeather);
 
function sendQuestionnaire(city, sexe, saison) {
    fetch('http://localhost:5000/questionnaire', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            cityInput: city,
            sexeInput: sexe,
            saisonInput: saison
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        // Select the div and update its content
        const outfitDiv = document.getElementById('outfit');
        let html = '';
        const order = ['Haut', 'Bas', 'Chaussures'];
        for (let outfit in data) {
            for (let tenue in data[outfit]) {
                const imageUrl = data[outfit][tenue]['imageURL']; // Store the imageURL in a variable
                html += `<div class="tenue p-6 max-w-sm bg-white rounded-xl shadow-md space-y-4 hover:bg-gray-100 transition-colors duration-200 ease-in-out" data-image-url="${imageUrl}">`; // Add the imageURL as a data attribute to the div
                html += `<div class="text-xl font-medium text-black">${tenue}</div>`;
                for (let item of order) {
                    if (data[outfit][tenue][item]) {
                        html += `<p class="text-gray-500">${item}: ${data[outfit][tenue][item]}</p>`;
                    }
                }
                html += `</div>`;
            }
        }

        // Define the mystery outfits
        const mysteryOutfits = [
            {
                haut: 'Rien - À POIL !',
                bas: 'Rien - À POIL !',
                chaussures: 'Rien - À POIL !',
                imageURL: 'https://i.ibb.co/ydWVzjt/Group-466apoil.png'
            },
            {
                haut: 'Perruque de clown',
                bas: 'Salopette',
                chaussures: 'Parpaings sur-mesure',
                imageURL: 'https://i.ibb.co/XCz3wP7/image-269clown.png'
            },
            {
                haut: 'Casque de moto',
                bas: 'Short de bain',
                chaussures: 'Tongs',
                imageURL: '"https://i.ibb.co/s3r4bWF/image-268moto.png'
            },
            {
                haut: 'Chemise hawaïenne',
                bas: 'Pantalon de jogging',
                chaussures: 'Crocs',
                imageURL: 'https://i.ibb.co/r765WtD/image-270hawai.png'
            },
        ];

        // Generate a random number between 0 and 100
        let randNum = Math.floor(Math.random() * 100);
        let selectedOutfit = null;
        // If the random number is less than or equal to 15 (15% chance), add the mystery outfit to the html
        if (randNum <= 100) {
            // Select a random mystery outfit
            const randomIndex = Math.floor(Math.random() * mysteryOutfits.length);
            selectedOutfit = mysteryOutfits[randomIndex];

            html += `<div id="tenueM" class="p-6 max-w-sm bg-white rounded-xl shadow-md space-y-4 hover:bg-gray-100 transition-colors duration-200 ease-in-out" data-image-url="${selectedOutfit.imageURL}">`;
            html += `<div class="text-xl font-medium text-black">Mystery Outfit Challenge !!</div>`;
            html += `<button id="revealButton" class="reveal-button">Click to reveal</button>`;
            html += `<div id="mysteryOutfit" class="mystery-outfit hidden">`;
            html += `<p class="text-gray-500">Haut: ${selectedOutfit.haut}</p>`;
            html += `<p class="text-gray-500">Bas: ${selectedOutfit.bas}</p>`;
            html += `<p class="text-gray-500">Chaussures: ${selectedOutfit.chaussures}</p>`;
            html += `</div></div>`;
        }

        outfitDiv.innerHTML = html;

        // Add event listener to the reveal button
        const revealButton = document.getElementById('revealButton');
        if (revealButton) {
            revealButton.addEventListener('click', function() {
                const mysteryOutfit = document.getElementById('mysteryOutfit');
                const tenueM = document.getElementById('tenueM');
                mysteryOutfit.style.display = 'block'; // Show the div
                mysteryOutfit.classList.add('visible'); // Add class to trigger animation
                this.style.display = 'none'; // Hide the button
                tenueM.className = 'tenue ' + tenueM.className;

                // Listen for the end of the animation
                mysteryOutfit.addEventListener('animationend', function() {
                    // Add event listener to the mystery outfit div after the animation has ended
                    tenueM.addEventListener('click', function() {
                        modal.style.display = "block";
                        img.src = selectedOutfit.imageURL;
                    });
                });
            });
        }
        
        // Get the modal
        var modal = document.getElementById("myModal");

        // Get the <span> element that closes the modal
        var span = document.getElementsByClassName("close")[0];

        // Get all the divs of tenue
        var tenueDivs = document.getElementsByClassName('tenue');

        // Get the img element in the modal
        var img = modal.getElementsByTagName('img')[0];

        // Add event listener to all divs of tenue
        for (let i = 0; i < tenueDivs.length; i++) {
            tenueDivs[i].addEventListener('click', function() {
                modal.style.display = "block";
                img.src = this.dataset.imageUrl;
            });
        }

        // When the user clicks on <span> (x), close the modal
        span.onclick = function() { 
            modal.style.display = "none";
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    })
    .catch(error => console.error('Error:', error));
}

function refreshWindow() {
    window.location.reload();
}

var options1 = {
    strings: ['Bonjour, je suis votre Chatbot Assistant Vestimentaire!'],
    typeSpeed: 15,
    showCursor: false
};

var options2 = {
    strings: ['Pour quelle ville souhaitez-vous connaître la meilleure tenue vestimentaire au vu de la météo?'],
    typeSpeed: 15,
    startDelay: 2500,
    showCursor: false
};

var typed1 = new Typed('#message1', options1);
var typed2 = new Typed('#message2', options2);

var cities = [
    "Paris",
    "Marseille",
    "Lyon",
    "Toulouse",
    "Nice",
    "Nantes",
    "Strasbourg",
    "Montpellier",
    "Bordeaux",
    "Lille",
    "Rennes",
    "Reims",
    "Le Havre",
    "Cergy-Pontoise",
    "Saint-Étienne",
    "Toulon",
    "Angers",
    "Grenoble",
    "Dijon",
    "Nîmes",
    "Aix-en-Provence",
    "Saint-Quentin-en-Yvelines",
    "Brest",
    "Le Mans",
    "Amiens",
    "Tours",
    "Limoges",
    "Clermont-Ferrand",
    "Villeurbanne",
    "Besançon",
    "Orléans",
    "Metz",
    "Rouen",
    "Mulhouse",
    "Perpignan",
    "Caen",
    "Boulogne-Billancourt",
    "Nancy",
    "Argenteuil",
    "Saint-Denis",
    "Roubaix",
    "Tourcoing",
    "Montreuil",
    "Avignon",
    "Nanterre",
    "Vitry-sur-Seine",
    "Créteil",
    "Poitiers",
    "Aubervilliers",
    "Versailles",
    "Colombes",
    "Asnières-sur-Seine",
    "Saint-Pierre",
    "Courbevoie",
    "Rueil-Malmaison",
    "Champigny-sur-Marne",
    "Antibes",
    "La Rochelle",
    "Saint-Maur-des-Fossés",
    "Calais",
    "Cannes",
    "Saint-Nazaire",
    "Mérignac",
    "Drancy",
    "Colmar",
    "Ajaccio",
    "Bourges",
    "Levallois-Perret",
    "La Seyne-sur-Mer",
    "Quimper",
    "Noisy-le-Grand",
    "Villeneuve-d'Ascq",
    "Valence",
    "Antony",
    "Cergy",
    "Pessac",
    "Ivry-sur-Seine",
    "Clichy",
    "Chambéry",
    "Les Abymes",
    "Niort",
    "Belfort",
    "La Roche-sur-Yon",
    "Saint-Quentin",
    "Sarcelles",
    "Évry",
    "Istres",
    "Le Blanc-Mesnil",
    "Vénissieux",
    "Troyes",
    "Clichy-sous-Bois",
    "Lorient",
    "Sartrouville",
    "Pontoise",
    "Saint-André",
    "Hyères",
    "Beauvais",
    "Épinay-sur-Seine",
    "Cholet",
    "Meaux",
    "Chelles",
    "Pantin",
    "Évry-Courcouronnes",
    "Saint-Louis",
    "La Rochelle",
    "La Seyne-sur-Mer",
    "Laval",
    "Villejuif",
    "Sevran",
    "Albi",
    "Charleville-Mézières",
    "Bondy",
    "Fréjus",
    "Arles",
    "Clamart",
    "Vannes",
    "Sarcelles",
    "Corbeil-Essonnes",
    "Saint-Ouen-sur-Seine",
    "Cagnes-sur-Mer",
    "Massy",
    "Grasse",
    "Montrouge",
    "Vincennes",
    "Mantes-la-Jolie",
    "Alfortville",
    "Martigues",
    "Saint-Brieuc",
    "Saint-Malo",
    "Chalon-sur-Saône",
    "Sète",
    "Meudon",
    "Épinay-sur-Seine",
    "Saint-Germain-en-Laye",
    "Saint-Herblain",
    "Évreux",
    "Brive-la-Gaillarde",
    "L'Ile-Saint-Denis",
    "Villeneuve-Saint-Georges",
    "Puteaux",
    "Rosny-sous-Bois",
    "Livry-Gargan",
    "Saint-Laurent-du-Maroni",
    "Saint-Joseph",
    "Saint-Paul",
    "Bron",
    "La Courneuve",
    "Saint-Germain-en-Laye",
    "Saint-Priest",
];

$(function() {
    $("#user-input").autocomplete({
        source: cities,
        autoFocus: true
    });
});

