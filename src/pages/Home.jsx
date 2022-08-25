import React from "react";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import AddChat from "../components/AddChat";
import "../App.css";

let socket = io.connect();

function Home() {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState([]);
  const [username, setUsername] = useState("");
  const [usernameValue, setUsernameValue] = useState("");
  const [userError, setUserError] = useState(<p className="user-error"></p>);
  const [userError2, setUserError2] = useState(false);
  const [currentRoom, setCurrentRoom] = useState("default");
  const [activeRoom, setActiveRoom] = useState("default");
  const [emojiPicker, setEmojiPicker] = useState(false);
  const [roomError, setRoomError] = useState(false);
  const [messageError, setMessageError] = useState(false);
  const [chats, setChats] = useState([]);
  const [input, setInput] = useState("");
  const [currentlyWriting, setCurrentlyWriting] = useState(false);
  const [writer, setWriter] = useState("");
  const [PM, setPM] = useState(false);
  const [whisperTo, setWhisperTo] = useState("");
  const [hidden, setHidden] = useState(true);
  const [messages, setMessages] = useState([]);
  const time = new Date().toTimeString();
  const date = new Date().toDateString();

  const emojis = [
    { name: "smile", emoji: "😀" },
    { name: "happy", emoji: "😁" },
    { name: "cute smile", emoji: "😊" },
    { name: "tears of joy", emoji: "😂" },
    { name: "awkwardness smile", emoji: "😅" },
    { name: "LOL", emoji: "🤣" },
    { name: "angel", emoji: "😇" },
    { name: "devil", emoji: "😈" },
    { name: "wink", emoji: "😉" },
    { name: "heart eyes", emoji: "😍" },
    { name: "love", emoji: "🥰" },
    { name: "cool", emoji: "😎" },
    { name: "apathy", emoji: "😑" },
    { name: "unhappy", emoji: "🙁" },
    { name: "angry", emoji: "😤" },
    { name: "sick", emoji: "😷" },
    { name: "crying", emoji: "😭" },
    { name: "surprise", emoji: "😲" },
    { name: "scream face", emoji: "😱" },
    { name: "upside down smiley", emoji: "🙃" },
    { name: "heart", emoji: "🧡" },
    { name: "fire", emoji: "🔥" },
    { name: "avocado", emoji: "🥑" },
    { name: "rainbow", emoji: "🌈" },
  ];

  useEffect(() => {
    socket = io("https://cme-saga-livechat-server.herokuapp.com");

    socket.on("connect", () => {
      socket.emit("set_default_room");
      socket.emit("get_chats");
      socket.emit("get_users");
    });

    socket.on("set_chats", (chats) => {
      chats.sort((a, b) => a.name.localeCompare(b.name));
      setChats(chats);
    });

    socket.on("set_users", (data) => {
      if (data.length > 0) {
        setUsers(data);
      } else {
        return;
      }
    });

    socket.on("deleted_chat", (data) => {
      setChats(data);
    });

    socket.on("new_user", (username) => {
      setUsername(username);
      setUser(username);
      setUserError(<p></p>);
    });

    socket.on("user_error", () => {
      setUserError(<p className="user-error">Username taken, try again!</p>);
    });

    socket.on("room_error", () => {
      setHidden(false);
      setRoomError(true);
    });

    socket.on("joined_room", (data, room) => {
      console.log(`${data} has joined the room ${room}`);

      if (room === "default") {
        setCurrentRoom("default");
        setActiveRoom("default");
      } else {
        socket.emit("get_messages", room);
        setCurrentRoom(room);
        setActiveRoom(room);
      }
    });

    socket.on("no_username", () => {
      setUserError2(true);
    });

    socket.on("set_messages", (data) => {
      console.log(data);
      if (data.length > 0) {
        const oldMessages = [];
        const obj = data;

        for (let i = 0; i < obj.length; i++) {
          const timeArray = obj[i].time.split(" ");
          const hhmm = timeArray[0].split(":");
          const dateArray = obj[i].date.split(" ");

          const newMessage = {
            username: obj[i].sender_id,
            text: obj[i].message,
            date: `${dateArray[1]} ${dateArray[2]} ${dateArray[3]}`,
            time: `${hhmm[0]}:${hhmm[1]}`,
          };

          oldMessages.push(newMessage);
        }
        setMessages(oldMessages);
      } else {
        return;
      }
    });

    socket.on("message", (data) => {
      const obj = data;
      const timeArray = obj.time.split(" ");
      const hhmm = timeArray[0].split(":");
      const dateArray = obj.date.split(" ");

      const newMessage = {
        username: data.username,
        text: data.text,
        date: `${dateArray[1]} ${dateArray[2]} ${dateArray[3]}`,
        time: `${hhmm[0]}:${hhmm[1]}`,
      };

      setMessages((messages) => [...messages, newMessage]);
    });

    socket.on("PM", (data) => {
      const obj = data;
      const timeArray = obj.time.split(" ");
      const hhmm = timeArray[0].split(":");
      const dateArray = obj.date.split(" ");

      const newMessage = {
        to: obj.to,
        username: data.username,
        text: data.text,
        date: `${dateArray[1]} ${dateArray[2]} ${dateArray[3]}`,
        time: `${hhmm[0]}:${hhmm[1]}`,
      };

      setMessages((messages) => [...messages, newMessage]);
    });

    socket.on("message_error", () => {
      setMessageError(true);
    });

    socket.on("writing", (data) => {
      setCurrentlyWriting(true);
      setWriter(data);
    });

    socket.on("not_writing", () => {
      setCurrentlyWriting(false);
    });

    socket.on("left_room", (data) => {
      console.log(`${data} has left the room`);
    });
  }, []);

  function handleUsername(e) {
    setUsernameValue(e.target.value);
  }

  function setUserName() {
    socket.emit("set_username", usernameValue);
    setUserError2(false);
  }

  function joinRoom(roomname) {
    socket.emit("join_room", roomname);
  }

  function deleteChat(chat) {
    socket.emit("delete_chat", JSON.stringify(chat));
  }

  function toggleAddChat() {
    setHidden(!hidden);
    setRoomError(false);
  }

  function handleInput(e) {
    setInput(e.target.value);

    if (e.target.value.length === 1) {
      socket.emit("currently_writing", currentRoom);
      setMessageError(false);
    }

    if (e.target.value.length === 0) {
      socket.emit("done_writing", currentRoom);
    }
  }

  function showEmojiPicker() {
    setEmojiPicker(!emojiPicker);
  }

  function addEmoji(emoji) {
    setInput(`${input}${emoji}`);
  }

  function handleMessage(room, whisperTo) {
    if (whisperTo) {
      socket.emit(
        "message",
        JSON.stringify({
          to: whisperTo,
          room: room,
          text: input,
          date: date,
          time: time,
        })
      );
    } else {
      socket.emit(
        "message",
        JSON.stringify({
          to: "all",
          room: room,
          text: input,
          date: date,
          time: time,
        })
      );
    }

    socket.emit("done_writing", currentRoom);

    setInput("");
    setMessageError(false);
    setEmojiPicker(false);
    setPM(false);
    setWhisperTo("");
  }

  function leaveRoom(roomname) {
    socket.emit("leave_room", roomname);
    setActiveRoom("default");
    setCurrentRoom("default");
  }

  function sendPM(whisperTo) {
    if (!username) {
      return;
    } else {
      setPM(true);
      setWhisperTo(whisperTo);
    }
  }

  return (
    <main className="main">
      <div className="chat-menu">
        <div className="user">
          <img
            className="user-icon-img"
            src="./user_icon.png"
            alt="user icon"
          ></img>

          {username === "" ? (
            <div className="user-input-field">
              <input
                type="text"
                className="username-input"
                onChange={handleUsername}
              ></input>
              <button className="user-info-button" onClick={setUserName}>
                Set username
              </button>

              {userError}
            </div>
          ) : (
            <p className="username">{username}</p>
          )}
        </div>

        <div className="chat-list">
          <div className="chats">
            <div className="chat-info">Chats</div>

            <button to="/addchat" className="add-chat">
              <img
                className="add-chat-img"
                src="./add_chat.png"
                alt="add a new chat"
                onClick={() => {
                  toggleAddChat();
                }}
              ></img>
            </button>
          </div>

          <div className={hidden ? "hidden" : null}>
            <AddChat
              toggleAddChat={toggleAddChat}
              socket={socket}
              roomError={roomError}
            ></AddChat>
          </div>
          {userError2 ? (
            <div className="no-username">
              <p className="no-username-p">Set username first</p>
            </div>
          ) : (
            <div></div>
          )}
          <ul className="chat-ul">
            {chats.sort().map((chat) => {
              return (
                <li
                  className={
                    activeRoom === chat.name
                      ? "chat-li current-room"
                      : " chat-li not-current-room"
                  }
                  key={chat.name}
                >
                  <div
                    className="chat-p"
                    onClick={() => {
                      joinRoom(chat.name);
                    }}
                  >
                    {chat.name}
                  </div>

                  <button
                    className="delete-chat-button"
                    onClick={() => {
                      deleteChat(chat);
                    }}
                  >
                    <img
                      className="delete-chat-button-img"
                      alt="delete chatroom"
                      src="/trash_can.png"
                    ></img>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="chat-box">
        <div className="chat-header">
          {currentRoom === "default" ? (
            <div className="home">
              <img className="home-img" src="/home.png" alt="home"></img>
            </div>
          ) : (
            <button
              className="back-arrow"
              onClick={() => {
                leaveRoom(currentRoom);
              }}
            >
              <img
                className="back-arrow-img"
                src="/close_button.png"
                alt="exit chat"
              ></img>
            </button>
          )}

          {currentRoom === "default" ? (
            <div className="room-name">Welcome</div>
          ) : (
            <div className="room-name">{currentRoom}</div>
          )}
        </div>

        <div
          className={
            currentRoom === "default" ? "messages no-scroll" : "messages scroll"
          }
        >
          {currentRoom === "default" ? (
            <div className="background">
              <div className="rules">
                <p className="welcome">Please follow guidlines and rules:</p>
                <ol>
                  <li>Set a username to access the chats</li>
                  <li>
                    You can also create your own chats. Name or topic can not
                    already exist.
                  </li>
                  <li>
                    You can only send private messages to users who are
                    currently online in the same chat room as you.
                  </li>
                  <li>
                    Private messages, whispers, are temporary and will disappear
                    if one of either sender or reciever exits the chat.
                  </li>
                  <li>
                    If a chat is deleted, so are the messages and can not be
                    retrieved again.
                  </li>
                </ol>
                <ul>
                  <li>Be kind and respectful</li>
                  <li>Stay on topic in the different chats</li>
                  <li>Do not link to unsafe sites</li>
                </ul>
                <h2 className="h2">
                  Start writing, share what you love and connect with others.
                </h2>
              </div>
            </div>
          ) : (
            <ul className="messages-ul">
              {messages.map((m) => {
                return (
                  <li className="messages-li" key={m.id}>
                    {m.to ? (
                      <p
                        className={
                          m.username === user ? "my-username" : "m-username"
                        }
                      >
                        {m.username} WHISPER TO {m.to}
                      </p>
                    ) : (
                      <p
                        className={
                          m.username === user ? "my-username" : "m-username"
                        }
                      >
                        {m.username}
                      </p>
                    )}
                    <div
                      className={m.username === user ? "my-div" : "m-message"}
                    >
                      <p
                        className={
                          m.username === user
                            ? "my-text my-message"
                            : "m-text other-message"
                        }
                      >
                        {m.text}
                      </p>
                      <p className={m.username === user ? "my-time" : "m-time"}>
                        {m.date} {m.time}
                      </p>
                    </div>
                  </li>
                );
              })}
              <li className="latest">Latest message</li>
              <hr className="hr"></hr>
            </ul>
          )}
        </div>

        {currentlyWriting ? (
          <div className="currently-writing">
            <p className="currently-writing-p">{writer} is writing</p>
          </div>
        ) : (
          <div className="currently-writing">
            <p className="currently-writing-p"></p>
          </div>
        )}

        {currentRoom === "default" ? (
          <div></div>
        ) : (
          <div className="send-message">
            {PM ? (
              <p className="whisper">WHISPER TO: {whisperTo}</p>
            ) : (
              <p className="whisper"></p>
            )}

            <div className="send-message-box">
              <button
                className="emoji-picker"
                onClick={showEmojiPicker}
              ></button>
              <input
                className="message-input"
                type="text"
                value={input}
                onChange={handleInput}
              ></input>
              <button
                className="send-message-button"
                onClick={() => {
                  handleMessage(currentRoom, whisperTo);
                }}
              >
                <img
                  className="send-message-img"
                  src="/send_message.png"
                  alt="send message"
                ></img>
              </button>
            </div>
            <div className="message-error-box">
              {messageError ? (
                <p className="message-error">Message can not be empty</p>
              ) : null}
            </div>

            {emojiPicker ? (
              <div className="emoji-box">
                <ul className="emoji-ul">
                  {emojis.map((emoji) => {
                    return (
                      <li
                        key={emoji.name}
                        className="emoji-li"
                        onClick={() => {
                          addEmoji(emoji.emoji);
                        }}
                      >
                        {emoji.emoji}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <div></div>
            )}
          </div>
        )}
      </div>

      <div className="users-list">
        <div className="users-header">
          <p className="online">Online</p>
        </div>

        {currentRoom === "default" ? (
          <ul className="users-ul">
            {users.map((user) => {
              if (user === username) {
                return <li className="users-li users-me">{user} [ME]</li>;
              } else {
                return <li className="users-li users-other">{user}</li>;
              }
            })}
          </ul>
        ) : (
          <ul className="users-ul">
            {users.map((user) => {
              if (user === username) {
                return <li className="users-li users-me">{user} [ME]</li>;
              } else {
                return (
                  <li
                    className="users-li users-other clickable"
                    onClick={() => {
                      sendPM(user);
                    }}
                  >
                    {user}
                    <img
                      className="mail"
                      src="./pm.png"
                      alt="private message"
                    ></img>
                  </li>
                );
              }
            })}
          </ul>
        )}
      </div>
    </main>
  );
}

export default Home;
