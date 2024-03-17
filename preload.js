const { ipcRenderer } = require('electron');

ipcRenderer.on('prevent-close', (event) => {
  event.preventDefault();
  window.hide(); // Hide the window instead of closing
});

function isValidUrl(url) {
  // Regular expression to match a valid URL
  const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;

  // Test if the URL matches the pattern
  return urlPattern.test(url);

}

function isMoreThanOneMinute(timeString) {
  // Split the time string into hours and minutes
  const [hours, minutes] = timeString.split(':').map(Number);

  // Calculate the total time in minutes
  const totalTimeInMinutes = hours * 60 + minutes;

  // Check if the total time is more than or equal to one minute
  return totalTimeInMinutes >= 1;
}

function convertToEmbeddedUrl(url) {
  // Extract the video ID from the YouTube URL
  const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);

  // If a match is found
  if (match) {
    // Construct the embedded URL
    return `https://www.youtube.com/embed/${match[1]}`;
  } else {
    // Return null if the URL is invalid
    return null;
  }
}

function timeToSeconds(timeString) {
  // Split the time string into hours and minutes
  const [hours, minutes] = timeString.split(':').map(Number);

  // Calculate the total number of seconds
  const totalSeconds = hours * 3600 + minutes * 60;

  return totalSeconds;
}


async function fetchFlashCardsInsert() {
  try {
    const response = await fetch('https://repeat.pythonanywhere.com/api/ext-list');
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await response.json();
    const listContainer = window.document.querySelector('.the-ultimate-note-box');

    const html = data.map(item => `
     <div class="the-note-box">
      <p>${item.title}</p>
      <p>${item.flash.length}</p>
  </div>`).join('');


    listContainer.innerHTML = html;
  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
}




async function fetchGraphData() {
  try {
    const response = await fetch('https://repeat.pythonanywhere.com/api/user-data');
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error.message);
    // You can handle the error here, like logging or displaying a message to the user
    throw error; // Rethrow the error if necessary
  }
}

async function displayGraphData() {
  try {
    const data = await fetchGraphData();
    const graphOne = window.document.querySelector('.graph-1');
    const graphTwo = window.document.querySelector('.graph-2');
    const theScore = window.document.querySelector('.the-score');
    const focusStatement = window.document.querySelector('.focus-statement')

    theScore.textContent = data[0].score;
    focusStatement.textContent = `over  ${data[0].week} hours of focused work this week`

    const monthArray = [];
    const monthObject = data[0].month;

    for (const key in monthObject) {
      if (Object.hasOwnProperty.call(monthObject, key)) {
        const obj = {};
        obj[key] = monthObject[key];
        monthArray.push(obj);
      }
    }

    const graphOneInsertion = monthArray.map((month, i) =>
      `<div class="box-container"">
      <div class="first-box first-box-${i}" style="background:rgb(255, 95, 95,${month[(i + 1)] / 100})"></div>
    </div>
    `).join('')

    graphOne.innerHTML = graphOneInsertion;

    const yearArray = []
    const yearObject = data[1].year;

    for (const key in yearObject) {
      if (Object.hasOwnProperty.call(yearObject, key)) {
        const obj = {};
        obj[key] = yearObject[key];
        yearArray.push(obj);
      }
    }

    const graphTwoInsertion = yearArray.map((month, i) => `
    <div class="box-container">
    <div class="second-box first-box-${i}" style="background:rgb(0, 205, 220,${month[(i + 1)] / 100})"></div>
    </div>
    `).join('')

    graphTwo.innerHTML = graphTwoInsertion;

  } catch (error) {
    console.error('Error:', error.message);
  }
}


async function fetchNotesData() {
  try {
    const response = await fetch('https://repeat.pythonanywhere.com/api/list-notes');

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await response.json();

    const notesContainer = window.document.querySelector('.notes-boxes');


    const html = data.map(note =>
      `<div class="note-box">
           <h1>${note.title}</h1>
        </div>`)
      .join('');

    notesContainer.innerHTML = html;
  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
}



window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }

  const body = document.body;
  displayGraphData();
  fetchNotesData();
  fetchFlashCardsInsert();

  const state = {
    isStarUpClicked: false,
    selectedOption: 'youtube', // youtube | website | localmedia
    youtubeInputContainer: '',
    websiteInputContainer: '',
    localMediaInputContainer: '',
    timeDuration: '00:00',
    distractionSaviourAi: true,
  }


  const renderWorkspace = () => {
    body.innerHTML = `
    <main class="application-container">
  <h1 class="application-title">Workspace options</h1>

  <div class="source-options">
    <div class="source-option youtube pointer selected">youtube</div>
    /
    <div class="source-option website pointer">website</div>
    /
    <div class="source-option localmedia pointer ">local media</div>
  </div>

  <div class="source-container">
    <!-- by Default it is youtube -->
    ${state.selectedOption === 'youtube' ? '<input type="text" name="url" id="youtube-url" placeholder="https://youtube.com" />' : ''}
    ${state.selectedOption === 'website' ? '<input type="text" name="url" id="website-url" placeholder="https://example.com" />' : ''}
    ${state.selectedOption === 'localmedia' ? '<input type="file" id="video-selector" name="video" accept="video/*" />' : ''}
  </div>

  <!-- Focus duration selector -->
  <div class="focus-duration-container">
    <h4>session time</h4>
    <div style="padding-top: 1rem">
      <input type="time" name="time" id="time-selector" value="00:00" />
    </div>
  </div>

  <!-- Distraction Saviour -->
  <div class="focus-duration-container">
    <h4>Distraction saviour AI</h4>
    <div class="saviour-selection">
      <div class="saviour-yes pointer ${state.distractionSaviourAi ? 'selected' : ''}">Yes</div>/
      <div class="saviour-no pointer ${!state.distractionSaviourAi ? 'selected' : ''}">No</div>
    </div>
  </div>
  <button class="start-session">Start Session</button>
</main>
`;
  }

  // Start up button
  const startUpButton = document.querySelector('.startup-button')
  startUpButton.addEventListener('click', () => {
    state.isStarUpClicked = true;
    renderWorkspace();

    const sourceContainer = window.document.querySelector('.source-container')
    const startSession = window.document.querySelector('.start-session')

    window.document.querySelectorAll('.source-option').forEach(source => source.addEventListener('click', () => {
      if (source.classList.contains('youtube')) {
        state.selectedOption = 'youtube';
        sourceContainer.innerHTML = `<input type="text" name="url" placeholder="https://youtube.com" id="youtube-url" />`
      }
      if (source.classList.contains('website')) {
        state.selectedOption = 'website';
        sourceContainer.innerHTML = `<input type="text" name="url" placeholder="https://example.com" id="website-url" />`
      }
      if (source.classList.contains("localmedia")) {
        state.selectedOption = 'localmedia';
        sourceContainer.innerHTML = `<input type="file" id="video-selector" name="video" accept="video/*" />`
      }
    }))

    startSession.addEventListener('click', () => {
      if (state.selectedOption === 'youtube') {
        const youtubeUrl = window.document.querySelector('#youtube-url');
        const timeSelector = window.document.querySelector('#time-selector')

        const youtubeUrlValue = youtubeUrl.value;
        const timeSelectorValue = timeSelector.value;

        if (!isValidUrl(youtubeUrl.value)) {
          console.log('not a valid yt url');
          return;
        };

        if (!isMoreThanOneMinute(timeSelector.value)) {
          console.log('Time is less than 1 minute');
          return;
        }

        state.youtubeInputContainer = convertToEmbeddedUrl(youtubeUrlValue)
        state.timeDuration = timeToSeconds(timeSelectorValue)

        body.innerHTML =
          `
          <div class="progress-bar">
             <div class="progress" id="progress"></div>
          </div>
  
          <main class="youtube-container">
            <iframe src=${state.youtubeInputContainer} frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </main>`

        let currentTime = 0;
        const progressElement = window.document.querySelector('.progress');

        // Define the event handler function
        function keydownEventHandler(event) {
          // Check if Alt + F4 is pressed
          if (event.altKey && event.key === 'F4') {
            console.log('Alt + F4 pressed');
            // Handle the event here, for example, prevent the default behavior
            event.preventDefault();
            // You can add your own logic to handle Alt + F4 combination
          }

          // Check if Ctrl + W is pressed
          if (event.ctrlKey && event.key === 'w') {
            console.log('Ctrl + W pressed');
            // Handle the event here, for example, prevent the default behavior
            event.preventDefault();
            // You can add your own logic to handle Ctrl + W combination
          }
        }

        // Add the event listener
        document.addEventListener('keydown', keydownEventHandler);

        function updateProgress() {
          // Calculate the progress percentage
          const progressPercentage = (currentTime / state.timeDuration) * 100;
          // Update the width of the progress bar
          progressElement.style.width = progressPercentage + '%';
          // Increment the current time
          currentTime++;

          if (currentTime >= state.timeDuration) {
            // Now to remove the event listener
            document.removeEventListener('keydown', keydownEventHandler);
          }

          // Check if time has not yet elapsed
          if (currentTime <= state.timeDuration) {
            // Call updateProgress function again after 1 second
            setTimeout(updateProgress, 1000);
          }
        }

        // Initial call to start updating progress
        updateProgress();
      }
    })

    // Add event listeners after updating the HTML content
    const saviourYes = document.querySelector('.saviour-yes');
    const saviourNo = document.querySelector('.saviour-no');

    saviourYes.addEventListener('click', () => {
      // Handle 'Yes' click
      state.distractionSaviourAi = true;
      saviourYes.classList.add('selected')
      saviourNo.classList.remove('selected')
    });

    saviourNo.addEventListener('click', () => {
      // Handle 'No' click
      state.distractionSaviourAi = false;
      saviourYes.classList.remove('selected')
      saviourNo.classList.add('selected')
    });
  });
});


