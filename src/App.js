import "./App.css";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useRef, useState } from "react";

firebase.initializeApp({
  apiKey: "AIzaSyCdjWlF5aXAp52ZyAwMqgjtO5i6ICGDwlw",
  authDomain: "chat-app-abec5.firebaseapp.com",
  projectId: "chat-app-abec5",
  storageBucket: "chat-app-abec5.appspot.com",
  messagingSenderId: "379307657247",
  appId: "1:379307657247:web:1913d35c3294fffa06ed2a",
  measurementId: "G-ZLKF3P28SE",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function SignIn() {
  const signInGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return <button onClick={signInGoogle}>{"Sign in with Google"}</button>;
}

function SignOut() {
  if (auth.currentUser) {
    return <button onClick={() => auth.signOut()}>{"Sign out"}</button>;
  }

  return null;
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageType = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <div className={`message ${messageType}`}>
      <img src={photoURL || "../public/circle-svgrepo-com.svg"} alt="" />
      <p>{text}</p>
    </div>
  );
}

function ChatRoom(props) {
  const { formValue, setFormValue } = props;

  const scrollToMessage = useRef();

  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);
  const [messages] = useCollectionData(query, { idField: "id" });

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    scrollToMessage.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        <span ref={scrollToMessage}></span>
      </main>
      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />
        <button type="submit">{"Send"}</button>
      </form>
    </>
  );
}

function App() {
  const [user] = useAuthState(auth);
  const [formValue, setFormValue] = useState("");

  return (
    <div className="App">
      <header>{user && <SignOut />}</header>
      <section>
        {user ? (
          <ChatRoom formValue={formValue} setFormValue={setFormValue} />
        ) : (
          <SignIn />
        )}
      </section>
    </div>
  );
}

export default App;
