import React, { createContext, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState([]);

  const history = useHistory();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);

    // Redirect to login if no user info
    if (!userInfo) {
      history.push("/"); // Use history.push() for redirection in v5
    }
  }, [history]);

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        setUser,
        notification,
        setNotification,
        chats,
        setChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to access the ChatContext
export const ChatState = () => {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error(
      "ChatContext is not found. Make sure the component is wrapped inside ChatProvider."
    );
  }

  return context;
};

export default ChatProvider;
