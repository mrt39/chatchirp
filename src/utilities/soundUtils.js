//utility file for handling audio notifications in the application
//used by MessageContext to play sounds when new messages arrive


//AUDIO FUNTIONALITY:
//modern web browsers implement security policies that restrict when audio can play without user interaction:
//how implementation here works:
//audio will only play after the user has interacted with the page (click, keystroke, etc.)
//once the user interacts, the audio context is unlocked
//after the first interaction, notification sounds will work as expected
 

//import the sound file
import messageNotification from "../assets/message-notification.mp3";

//audio object that will be preloaded when the app initializes
let notificationSound = null;
//flag to track if user has interacted with the page
let userInteracted = false;
//flag to prevent multiple preload success messages
let preloadLogged = false;

//preload the notification sound to avoid latency when playing
export function preloadNotificationSound() {
  try {
    notificationSound = new Audio(messageNotification);
    
    //start loading the audio file
    notificationSound.load();
    
    //add event listener to confirm loading is complete
    notificationSound.addEventListener('canplaythrough', () => {
      if (!preloadLogged) {
        console.log('Notification sound preloaded successfully');
        preloadLogged = true;
      }
    });
    
    //handle any loading errors
    notificationSound.addEventListener('error', (e) => {
      console.error('Error preloading notification sound:', e);
    });
    
    //set up event listeners to detect user interaction with the page
    //these will enable sound playback after user has interacted with the page
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });
  } catch (error) {
    console.error('Error creating Audio object:', error);
  }
}

//mark that user has interacted with the page
function handleUserInteraction() {
  userInteracted = true;
  
  //try to play and immediately pause to unlock audio playback
  if (notificationSound) {
    notificationSound.volume = 0; // silent
    notificationSound.play()
      .then(() => {
        notificationSound.pause();
        notificationSound.currentTime = 0;
        notificationSound.volume = 1; // restore volume
      })
      .catch(error => {
        console.log('Audio context still not unlocked:', error);
      });
  }
}

//play the notification sound if it's loaded
export function playNotificationSound() {
  if (notificationSound) {
    //reset the sound to the beginning (in case it was played before)
    notificationSound.currentTime = 0;
    
    //play the sound
    notificationSound.play()
      .catch(error => {
        //if error is because user hasn't interacted with the page yet, don't log it
        if (error.name !== 'NotAllowedError') {
          console.error('Error playing notification sound:', error);
        }
      });
  }
}