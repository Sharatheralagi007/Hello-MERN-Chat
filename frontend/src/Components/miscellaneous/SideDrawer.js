import React, { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Button,
  Input,
  Text,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Spinner,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { ChatState } from "../../Context/ChatProvider";
import axios from "axios";
import { useHistory } from "react-router-dom";
import io from "socket.io-client";
import ChatLoading from "../ChatLoading";
import UserListItem from "../UserAvatar/UserListItem";
import ProfileModal from "./ProfileModal";

const ENDPOINT = "http://localhost:5000";
let socket;

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const {
    user,
    setSelectedChat,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const history = useHistory();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load search results",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.post("/api/chat", { userId }, config);

      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }

      setSelectedChat(data);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to access chat",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingChat(false);
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => console.log("Socket connected"));
    socket.on("message received", (newMessage) => {
      if (!notification.find((notif) => notif._id === newMessage._id)) {
        setNotification([newMessage, ...notification]);
      }
    });

    return () => socket.disconnect();
  }, [notification, setNotification, user]);

  return (
    <>
      <Box display="flex" justifyContent="space-between" bg="white" p={3}>
        <Tooltip label="Search Users">
          <Button variant="ghost" onClick={onOpen}>
            <i className="fas fa-search"></i>
            <Text px={2}>Search User</Text>
          </Button>
        </Tooltip>
        <Text fontSize="2xl">Chat App</Text>
        <Menu>
          <MenuButton p={1}>
            <BellIcon fontSize="2xl" />
          </MenuButton>
          <MenuList>
            {notification.map((notif) => (
              <MenuItem
                key={notif._id}
                onClick={() => setSelectedChat(notif.chat)}
              >
                New message from {notif.sender.name}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            <Avatar size="sm" src={user.pic} />
          </MenuButton>
          <MenuList>
            <ProfileModal user={user}>
              <MenuItem>Profile</MenuItem>
            </ProfileModal>
            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
          </MenuList>
        </Menu>
      </Box>

      <Drawer placement="left" isOpen={isOpen} onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>Search Users</DrawerHeader>
          <DrawerBody>
            <Box display="flex" mb={4}>
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Search</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
