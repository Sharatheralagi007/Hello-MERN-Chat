import React, { useEffect } from "react";
import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import Login from "../Components/Authentication/Login";
import Signup from "../Components/Authentication/Signup";
import { useHistory } from "react-router-dom"; // Use useHistory for React Router v5

const Homepage = () => {
  const history = useHistory(); // useHistory for React Router v5

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) {
      // Use history.push() to navigate to the chats page
      history.push("/chats");
    }
  }, [history]); // Add history as a dependency

  return (
    <Container maxW="xl" centerContent>
      <Box
        display="flex"
        justifyContent="center"
        p={3}
        bg={"white"}
        w={"100%"}
        m={"20px 0 5px 0"}
        borderRadius={"7px"}
        border={"2px solid black"}
      >
        <Text fontSize={"3xl"} fontFamily={"work sans"} color={"black"}>
          <b>Hello....</b>
        </Text>
      </Box>
      <Box
        bg={"white"}
        w={"100%"}
        p={4}
        borderRadius={"7px"}
        border={"2px solid black"}
      >
        <Tabs isFitted variant="soft-rounded">
          <TabList mb="1em">
            <Tab>Login</Tab>
            <Tab>Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
};

export default Homepage;
