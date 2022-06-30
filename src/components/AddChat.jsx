import React from "react";
import { useState } from "react";

function AddChat(props) {
  let socket = props.socket;

  const [chatName, setChatName] = useState("");

  function handleChatName(e) {
    setChatName(e.target.value);
  }

  function addChat() {
    socket.emit("create_room", JSON.stringify({ name: chatName }));
    setChatName("");
  }

  return (
    <div className="create-room">
      <div className="form">
        <p className="label">Chat name</p>
        <input
          className="form-input"
          type="text"
          value={chatName}
          onChange={handleChatName}
        ></input>
        {props.roomError ? (
          <p className="room-error">Chat already exist.</p>
        ) : (
          <p className="room-error"></p>
        )}
        <button
          type="button"
          className="create-room-button"
          onClick={() => {
            props.toggleAddChat();
            addChat();
          }}
        >
          Create chat room
        </button>
      </div>
    </div>
  );
}

export default AddChat;
