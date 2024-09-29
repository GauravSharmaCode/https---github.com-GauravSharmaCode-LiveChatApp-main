import React, { useContext, useEffect, useRef, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import MessageSelf from "./MessageSelf";
import MessageOthers from "./MessageOthers";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Skeleton from "@mui/material/Skeleton";
import axios from "axios";
import { myContext } from "./MainContainer";
import { io } from "socket.io-client";

// Initialize socket connection
const socket = io("http://localhost:8080", {
  transports: ["websocket"],
  autoConnect: true,
});

/**
 * ChatArea is a component that displays a chat between two users.
 * It fetches messages when the component mounts and when the refresh state is updated.
 * It also listens for new messages and updates the state when a new message is received.
 * It takes in a chat_id and a user object as props.
 * @param {string} chat_id The id of the chat to display.
 * @param {object} user The user object of the current user.
 * @returns {JSX.Element} The ChatArea component.
 */
function ChatArea() {
  const lightTheme = useSelector((state) => state.themeKey);
  const [messageContent, setMessageContent] = useState("");
  const messagesEndRef = useRef(null);
  const dyParams = useParams();
  const [chat_id, chat_user] = dyParams._id.split("&");
  const userData = JSON.parse(localStorage.getItem("userData"));
  const [allMessages, setAllMessages] = useState([]);
  const { refresh, setRefresh } = useContext(myContext);
  const [loaded, setLoaded] = useState(false);

  // Setup user when the component mounts
  useEffect(() => {
    if (userData?.data?._id) {
      socket.emit("setup", userData.data); // Send the user data to backend for setup
    }

    // Join chat room
    socket.emit("join chat", chat_id);

    return () => {
      socket.off("setup");
      socket.off("join chat");
    };
  }, [chat_id, userData.data]);

  // Listen for new messages
  useEffect(() => {
    /**
     * Updates the state with the new message, only if the new message is not already in the state.
     * @param {object} newMessage The new message object.
     */
    const handleMessageReceived = (newMessage) => {
      // Only update if the new message is not already in the state
      setAllMessages((prevMessages) => {
        if (!prevMessages.some((msg) => msg._id === newMessage._id)) {
          return [...prevMessages, newMessage];
        }
        return prevMessages;
      });
    };

    socket.on("message received", handleMessageReceived);

    return () => {
      socket.off("message received", handleMessageReceived);
    };
  }, []);

  // Fetch messages when chat_id changes or refresh is triggered
  useEffect(() => {
    const config = {
      headers: {
        Authorization: `Bearer ${userData.data.token}`,
      },
    };
    axios
      .get("http://localhost:8080/message/" + chat_id, config)
      .then(({ data }) => {
        // Only update state if there are new messages
        setAllMessages(data);
        setLoaded(true);
      });
  }, [chat_id, refresh, userData.data.token]);

  // Send a message to the server
  const sendMessage = () => {
    if (!messageContent) return; // Prevent sending empty messages

    const config = {
      headers: {
        Authorization: `Bearer ${userData.data.token}`,
      },
    };

    const newMessage = {
      content: messageContent,
      chatId: chat_id,
      sender: userData.data, // Include sender info
    };

    // Send the message to the server
    axios
      .post("http://localhost:8080/message/", newMessage, config)
      .then(({ data }) => {
        // Emit the new message to the backend after a successful send
        socket.emit("new message", data);
        setMessageContent(""); // Clear the input after sending
      });
  };

  if (!loaded) {
    return (
      <div
        style={{
          border: "20px",
          padding: "10px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <Skeleton
          variant="rectangular"
          sx={{ width: "100%", borderRadius: "10px" }}
          height={60}
        />
        <Skeleton
          variant="rectangular"
          sx={{ width: "100%", borderRadius: "10px", flexGrow: "1" }}
        />
        <Skeleton
          variant="rectangular"
          sx={{ width: "100%", borderRadius: "10px" }}
          height={60}
        />
      </div>
    );
  } else {
    return (
      <div className={"chatArea-container" + (lightTheme ? "" : " dark")}>
        <div className={"chatArea-header" + (lightTheme ? "" : " dark")}>
          <p className={"con-icon" + (lightTheme ? "" : " dark")}>
            {chat_user[0]}
          </p>
          <div className={"header-text" + (lightTheme ? "" : " dark")}>
            <p className={"con-title" + (lightTheme ? "" : " dark")}>
              {chat_user}
            </p>
          </div>
          <IconButton className={"icon" + (lightTheme ? "" : " dark")}>
            <DeleteIcon />
          </IconButton>
        </div>
        <div className={"messages-container" + (lightTheme ? "" : " dark")}>
          {allMessages
            .slice(0)
            .reverse()
            .map((message, index) => {
              const sender = message.sender;
              const self_id = userData.data._id;
              if (sender._id === self_id) {
                return <MessageSelf props={message} key={index} />;
              } else {
                return <MessageOthers props={message} key={index} />;
              }
            })}
        </div>
        <div ref={messagesEndRef} className="BOTTOM" />
        <div className={"text-input-area" + (lightTheme ? "" : " dark")}>
          <input
            placeholder="Type a Message"
            className={"search-box" + (lightTheme ? "" : " dark")}
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyDown={(event) => {
              if (event.code === "Enter") {
                sendMessage();
              }
            }}
          />
          <IconButton
            className={"icon" + (lightTheme ? "" : " dark")}
            onClick={sendMessage}
          >
            <SendIcon />
          </IconButton>
        </div>
      </div>
    );
  }
}

export default ChatArea;
