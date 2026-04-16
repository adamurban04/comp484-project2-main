$(function() { // Makes sure that function is called once all the DOM elements of the page are ready to be used.
    
    // Update the pet stats
    checkAndUpdatePetInfoInHtml();
  
    // Instead of attaching 4 separate click handlers (one per button), I attach ONE handler to the
    // parent container. This pattern is called *event delegation* and it keeps the code shorter.
    // It also keeps working even if we ever change the buttons later (because the container stays).
    //
    // UNIQUE jQuery method #1: .closest(selector)
    // - What it does:
    //   Starting from a specific element, .closest() walks UP the DOM tree (parents, grandparents, etc.)
    //   until it finds the nearest ancestor that matches the selector.
    //
    // - Why it is useful here:
    //   When you click a button, the actual `event.target` might not be the <button> itself.
    //   Example: if the button contains text or other HTML, the click could land on a child node.
    //   By doing $(event.target).closest('button'), I reliably get the real button that was clicked,
    //   so my .hasClass('treat-button') / .hasClass('play-button') checks always work.
    //   If the click wasn't on a button at all, $button will just be an empty jQuery object and
    //   none of the action branches will run.
    $('.button-container').on('click', function (event) {
      var $button = $(event.target).closest('button');


      if ($button.hasClass('treat-button')) {
        clickedTreatButton();
      } else if ($button.hasClass('play-button')) {
        clickedPlayButton();
      } else if ($button.hasClass('exercise-button')) {
        clickedExerciseButton();
      } else if ($button.hasClass('sleep-button')) {
        clickedSleepButton();
      }
    });

    // Change-name listeners:
    // Read the input box and update pet_info.name
    $('.set-name-button').click(setPetNameFromInput);
    $('.name-input').on('keydown', function (event) {
      if (event.key === 'Enter') {
        setPetNameFromInput();
      }
    });
  })
  
    // Pet stats object (with default values)
    var pet_info = { name: "Amin", weight: 20, happiness: 50, energy: 10 };

    // Change Name function
    function setPetNameFromInput() {
      // This takes whatever the user typed and sets it as the pet name.
      var newName = $('.name-input').val().trim();

      if (!newName) {
        showPetMessage("Type a name first!");
        return;
      }

      // Keep it a reasonable length so it doesn't break the layout
      if (newName.length > 16) {
        newName = newName.slice(0, 16);
      }

      pet_info.name = newName;
      $('.name-input').val('');

      checkAndUpdatePetInfoInHtml();
      showPetMessage("My new name is " + newName + "!");
    }

    // ACTION BUTTONS EVENT HANDLERS
  
    function clickedTreatButton() {
      // Treat
      pet_info.happiness += 2;
      pet_info.weight += 1;
      pet_info.energy += 1;

      setPetSprite('treat');
      playSfx('sfx-treat');
      showPetMessage("Yum!");
      checkAndUpdatePetInfoInHtml();
    }
    
    function clickedPlayButton() {
      // Play
      pet_info.happiness += 4;
      pet_info.weight -= 1;
      pet_info.energy -= 2;

      setPetSprite('play');
      playSfx('sfx-play');
      showPetMessage("Fun!");
      checkAndUpdatePetInfoInHtml();
    }
    
    function clickedExerciseButton() {
      // Exercise
      pet_info.happiness -= 1;
      pet_info.weight -= 2;
      pet_info.energy -= 3;

      setPetSprite('exercise');
      playSfx('sfx-exercise');
      showPetMessage("Whew... musclesss, yay!");
      checkAndUpdatePetInfoInHtml();
    }

    function clickedSleepButton() {
      // Sleep
      pet_info.happiness += 1;
      pet_info.energy += 5;

      setPetSprite('sleep');
      playSfx('sfx-sleep');
      showPetMessage("Zzz...");
      checkAndUpdatePetInfoInHtml();
    }

    // Sprite moods (paths)
    var pet_sprites = {
      neutral: "images/neutral.jpg",
      treat: "images/treat.jpg",
      play: "images/play.jpg",
      exercise: "images/exercise.jpg",
      sleep: "images/sleep.jpg",
      tired: "images/tired.jpg"
    };

    // flag so I know if the sprite was forced to "tired" because a stat went critical.
    var spriteForcedTired = false;

    // Set sprite to correct mood
    function setPetSprite(moodKey) {
      // Swap the sprite image based on what the pet is doing
      var spritePath = pet_sprites[moodKey] || pet_sprites.neutral;
      $('#pet-sprite').attr('src', spritePath);

      // UNIQUE jQuery method #2: .animate(properties, duration)
      // - What it does:
      //   .animate() smoothly changes numeric CSS properties over time.
      //   It takes an object of CSS properties to animate (ex: { top: -10 }) plus a duration in ms.
      //
      // - Why it is useful here:
      //   This little "bounce" makes the pet feel responsive whenever you click an action
      //
      // .stop(true, true) is there so repeated clicks don't stack a huge queue of bounces
      $('#pet-sprite')
        .stop(true, true)
        .animate({ top: -10 }, 90)
        .animate({ top: 0 }, 140);
    }

    function playSfx(audioId) {
      // Sound effect helper
      var audio = document.getElementById(audioId);
      if (!audio) return;
      var hasFile = !!audio.getAttribute('src') || !!audio.currentSrc || !!audio.querySelector('source');
      if (!hasFile) return;

      try {
        audio.muted = false;
        audio.volume = 1;

        // Restart the sound from the beginning each click
        audio.pause();
        audio.currentTime = 0;

        var playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () { // catch errors
          });
        }
      } catch (e) {
      }
    }

    function showPetMessage(message) {
      // This updates the fixed text box at the bottom of the screen.
      // This is a visual notification (not alert() and not console.log()).

      var $messageBox = $('.pet-message');
      $messageBox.text(message);

      // .animate() jQuery method again: 
      //  I start the message slightly faded (opacity 0.25), then animate it back to 1.
      $messageBox
        .css({ opacity: 0.25 })
        .animate({ opacity: 1 }, 220);
    }

    function checkAndUpdatePetInfoInHtml() {
      checkWeightAndHappinessAndEnergyBeforeUpdating();  
      updatePetInfoInHtml();
    }
    
    function checkWeightAndHappinessAndEnergyBeforeUpdating() {
      // Quick bug fix: we never want negative numbers for these stats.
      // If a value dips below 0, set it back to 0.
      if (pet_info.weight < 0) {
        pet_info.weight = 0;
      }

      if (pet_info.happiness < 0) {
        pet_info.happiness = 0;
      }

      if (pet_info.energy < 0) {
        pet_info.energy = 0;
      }
    }
    
    // Updates HTML with current values in pet_info object
    function updatePetInfoInHtml() {
      $('.name').text(pet_info['name']);
      $('.weight').text(pet_info['weight']);
      $('.happiness').text(pet_info['happiness']);
      $('.energy').text(pet_info['energy']);

      updateCriticalStatColors();
    }

    function updateCriticalStatColors() {
      // If stats get too low or too high, highlight them in red.

      var weightCritical = (pet_info.weight <= 5) || (pet_info.weight >= 50);
      var happinessCritical = (pet_info.happiness <= 25);
      var energyCritical = (pet_info.energy <= 2);

      setCritical('.weight', weightCritical);
      setCritical('.happiness', happinessCritical);
      setCritical('.energy', energyCritical);

      // If any stat is critical, show the tired sprite
      // This makes it obvious that the pet needs attention
      var anyCritical = weightCritical || happinessCritical || energyCritical;

      if (anyCritical) {
        setPetSprite('tired');
        spriteForcedTired = true;
      } else if (spriteForcedTired) {
        // If we previously forced tired, switch back once everything is safe
        setPetSprite('neutral');
        spriteForcedTired = false;
      }
    }

    function setCritical(selector, isCritical) {
      var el = document.querySelector(selector);
      if (!el) return;

      if (isCritical) {
        el.classList.add('critical');
      } else {
        el.classList.remove('critical');
      }
    }
  