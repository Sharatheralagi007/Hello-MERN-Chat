import React, { useState, useEffect } from "react";
import { ChatState } from "../Context/ChatProvider";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./miscellaneous/ProfileModal";
import axios from "axios";
import "./style.css";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../Animation/typing.json";

const ENDPOINT = "http://localhost:5000"; // Replace with your server URL
let socket, selectedChatCompare;

function SingleChat({ fetchAgain, setFetchAgain }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const { user, selectedChat, setSelectedChat } = ChatState();
  const toast = useToast();

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => console.log("Socket connected"));

    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
    socket.on("message received", (newMessage) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessage.chat._id
      ) {
        // Notify the user about the new message
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;
      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.get(
          `/api/message/${selectedChat._id}`,
          config
        );
        setMessages(data);
        setLoading(false);
        socket.emit("join chat", selectedChat._id);
        selectedChatCompare = selectedChat;
      } catch (error) {
        setLoading(false);
        toast({
          title: "Error loading messages",
          description: error.response.data.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchMessages();
  }, [selectedChat, user.token, toast]);

  const sendMessage = async (e) => {
    if (e.key === "Enter" && newMessage.trim()) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };

        const { data } = await axios.post(
          "/api/message",
          { content: newMessage, chatId: selectedChat._id },
          config
        );

        setNewMessage("");
        setMessages([...messages, data]);
        socket.emit("new message", data);
      } catch (error) {
        toast({
          title: "Error sending message",
          description: error.response.data.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socket) return;

    if (!isTyping) {
      socket.emit("typing", selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    const timerLength = 3000;

    setTimeout(() => {
      const timeNow = new Date().getTime();
      if (timeNow - lastTypingTime >= timerLength) {
        socket.emit("stop typing", selectedChat._id);
      }
    }, timerLength);
  };

  if (!selectedChat) {
    return (
      <Text fontSize="xl" textAlign="center" mt="50%">
        Select a chat to view messages
      </Text>
    );
  }

  return (
    <Box
      display="flex"
      flexDir="column"
      justifyContent="flex-end"
      w="100%"
      h="100%"
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        pb={3}
      >
        <IconButton
          display={{ base: "flex" }}
          icon={<ArrowBackIcon />}
          onClick={() => setSelectedChat("")}
        />
        <Text fontSize={{ base: "28px", md: "30px" }} fontFamily="Work sans">
          {selectedChat.isGroupChat
            ? selectedChat.chatName
            : getSender(user, selectedChat.users)}
        </Text>
        <ProfileModal user={getSenderFull(user, selectedChat.users)} />
      </Box>

      <Box
        display="flex"
        flexDir="column"
        justifyContent="flex-end"
        p={3}
        bg="#E8E8E8"
        w="100%"
        h="100%"
        borderRadius="lg"
        border="1px solid #ddd"
        overflowY="scroll"
      >
        {loading ? (
          <Spinner size="xl" />
        ) : (
          <ScrollableChat messages={messages} />
        )}

        {isTyping && (
          <Box
            display="flex"
            justifyContent="flex-start"
            alignItems="center"
            ml={3}
          >
            <Lottie options={defaultOptions} height={50} width={50} />
          </Box>
        )}

        <FormControl onKeyDown={sendMessage} isRequired mt={3}>
          <Input
            variant="filled"
            bg="#E0E0E0"
            placeholder="Enter a message"
            value={newMessage}
            onChange={typingHandler}
          />
        </FormControl>
      </Box>
    </Box>
  );
}

export default SingleChat;
