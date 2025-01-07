import React, { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import { Button, Stack, useToast, Text, Box } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import axios from "axios";
import ChatLoading from "./ChatLoading";
import { getSender } from "../config/ChatLogics";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { io } from "socket.io-client";

const ENDPOINT = "http://localhost:5000"; // Replace with your backend URL
let socket;

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState(null);
  const { user, setSelectedChat, selectedChat, chats, setChats } = ChatState();
  const toast = useToast();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to Load Chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userInfo"));
    if (storedUser) {
      setLoggedUser(storedUser);
      if (storedUser.token) {
        fetchChats();
      }
    }

    // Setup socket connection
    socket = io(ENDPOINT);
    socket.emit("setup", storedUser);

    // Listen for new messages
    socket.on("message received", (newMessage) => {
      setChats((prevChats) => {
        const updatedChats = [...prevChats];
        const chatIndex = updatedChats.findIndex(
          (chat) => chat._id === newMessage.chat._id
        );

        if (chatIndex >= 0) {
          updatedChats[chatIndex].latestMessage = newMessage;
          return updatedChats;
        }

        return [newMessage.chat, ...updatedChats];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchAgain]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily={"work sans"}
        display={"flex"}
        w={"100%"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        My Chats
        <GroupChatModal>
          <Button
            display={"flex"}
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            Create new Group
          </Button>
        </GroupChatModal>
      </Box>

      <Box
        display={"flex"}
        flexDir={"column"}
        p={3}
        bg={"#F8F8F8"}
        w={"100%"}
        h={"100%"}
        borderRadius="lg"
        overflowY={"hidden"}
      >
        {chats && chats.length > 0 ? (
          <Stack overflowY={"scroll"}>
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor={"pointer"}
                color={selectedChat === chat ? "white" : "black"}
                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
              >
                <Text fontWeight="bold">
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </Text>
                {chat.latestMessage && (
                  <Text fontSize="sm" color="gray.600">
                    {chat.latestMessage.sender.name}:{" "}
                    {chat.latestMessage.content}
                  </Text>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
