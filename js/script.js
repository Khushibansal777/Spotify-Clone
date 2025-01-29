console.log('Let\'s write javascript');
let currentsong = new Audio();
let songs;
let currFolder;
async function getsongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}`)
  let response = await a.text();
  let div = document.createElement('div');
  div.innerHTML = response;
  let as = div.getElementsByTagName('a');
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith('.mp3')) {
      songs.push(element.href.split(`/${folder}/`)[1])
    }
  }
  let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
  songUL.innerHTML = "";
  //show all songs in playlist
  for (const song of songs) {
    songUL.innerHTML = songUL.innerHTML + `<li>
        <img class="invert" src="img/music.svg" alt="">
        <div class="info">
          <div>${song.replaceAll("%20", " ")}</div>
          <div>Song Artist</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
        <img  class="invert" src="img/play.svg" alt="">
      </div></li>`;

  }
  // Attach an event listener to each song
  Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", element => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML.trim());
      playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    })

  })
  return songs

}
const playmusic = (track, pause = false) => {
  if (!pause) {
    currentsong.src = `/${currFolder}/` + track;
    currentsong.play()
    play.src = 'img/pause.svg'
  }
  document.querySelector('.songinfo').innerHTML = decodeURI(track);
  document.querySelector('.songtime').innerHTML = '00:00/00:00';

}
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  seconds = Math.floor(seconds);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedSeconds = remainingSeconds.toString().padStart(2, '0');
  return `${minutes}:${formattedSeconds}`;
}
async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:3000/songs/`)
  let response = await a.text();
  let div = document.createElement('div');
  div.innerHTML = response;
  let anchors= div.getElementsByTagName('a')
  let cardContainer=document.querySelector(".cardContainer")
  let array=Array.from(anchors)
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if(e.href.includes("\songs")){
       //console.log(e.href.split("/").slice(-2)[0]);
       let folder = e.href.split("/").slice(-2)[0];
       //console.log(folder);
       
       // get the metadata of the folder
       let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
       let response = await a.json();
       //console.log(response);
       cardContainer.innerHTML=cardContainer.innerHTML+`<div  data-folder="${folder}"class="card">
                    <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" style="display: inline-block;">
                    <circle cx="12" cy="12" r="12" style="fill: #3be477;"  />
                    <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" class="play-button" /></svg>
                </div>
                <img src="/songs/${folder}/cover.jpeg" alt="">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
                </div>`
    }
  }
  // load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName('card')).forEach(e => {
    //console.log(e);
    e.addEventListener('click', async item => {
      songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
      playmusic(songs[0])
  })
  })

}
async function main() {
  // Get the list of all songs
  await getsongs('songs/ncs');
  playmusic(songs[0], true);
  displayAlbums()


  // Attach an event listener to play
  play.addEventListener('click', () => {
    if (currentsong.paused) {
      currentsong.play()
      play.src = 'img/pause.svg'
    }
    else {
      currentsong.pause()
      play.src = 'img/play.svg'
    }
  })
  // listen for timeupdate event
  currentsong.addEventListener('timeupdate', () => {
    console.log(currentsong.currentTime, currentsong.duration);
    document.querySelector(".songtime").innerHTML = `${formatTime(currentsong.currentTime)} / ${formatTime(currentsong.duration)}`
    document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + '%';
  })
  // add an event listener to seekbar
  document.querySelector('.seekbar').addEventListener('click', e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
    document.querySelector('.circle').style.left = percent + '%';
    currentsong.currentTime = ((currentsong.duration) * percent) / 100
  })
  // add an event listener to previous 
  previous.addEventListener("click", () => {
    console.log('previous clicked');
    let index = songs.indexOf(currentsong.src.split('/').slice(-1)[0]);
    if ((index - 1) >= 0) {
      playmusic(songs[index - 1])
    }
  })
  // add an event listener to next
  next.addEventListener("click", () => {
    console.log('next clicked');
    let index = songs.indexOf(currentsong.src.split('/').slice(-1)[0]);
    if ((index + 1) < songs.length) {
      playmusic(songs[index + 1])
    }
  })
  // add an event listener to volume
  document.querySelector('.volume').getElementsByTagName('input')[0].addEventListener('change', (e) => {
    console.log('Setting volume to', e.target.value, '/ 100');
    currentsong.volume = parseInt(e.target.value) / 100
    if(currentsong.volume >0){
      document.querySelector('.volume>img').src=document.querySelector('.volume>img').src.replace("img/mute.svg",'img/volume.svg');
    }
  })
  // add an event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click",(e=>{
      if(e.target.src.includes("img/volume.svg")){
        e.target.src=e.target.src.replace("img/volume.svg",'img/mute.svg');
        currentsong.volume=0;
        document.querySelector('.volume').getElementsByTagName('input')[0].value=0;
      }
      else{
        e.target.src=e.target.src.replace("img/mute.svg",'img/volume.svg');
        currentsong.volume=0.10;
        document.querySelector('.volume').getElementsByTagName('input')[0].value=10
      }
  }))
  // Add an event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0"
})

// Add an event listener for close button
document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
    
})



}



main()