import firebase from 'firebase/app';
import 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAz5Ck0fl_209NXS02npvG9z4taCJ0czFo',
  authDomain: 'react-typing-game-987f2.firebaseapp.com',
  databaseURL: 'https://react-typing-game-987f2-default-rtdb.firebaseio.com',
  projectId: 'react-typing-game-987f2',
  storageBucket: 'react-typing-game-987f2.appspot.com',
  messagingSenderId: '639240549479',
  appId: '1:639240549479:web:e39790fc3c8e3d70e590c2',
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;
