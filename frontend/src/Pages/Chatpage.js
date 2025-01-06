import { Box } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import SideDrawer from "../Components/miscellaneous/SideDrawer";
import MyChats from "../Components/MyChats";
import ChatBox from "../Components/ChatBox";
import { useState } from "react";

const Chatpage = () => {
  const { user } = ChatState(); // Get the user from the ChatContext
  const [fetchAgain, setFetchAgain] = useState(false); // Correctly initialize state

  return (
    <div style={{ width: "100%" }}>
      {user && <SideDrawer />}{" "}
      {/* Show the SideDrawer only if the user is present */}
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        w={"100%"}
        h="91.5vh"
        p={"10px"}
      >
        {user && <MyChats fetchAgain={fetchAgain} />}{" "}
        {/* Pass fetchAgain to MyChats */}
        {user && (
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} /> // Pass fetchAgain and setFetchAgain to ChatBox
        )}
      </Box>
    </div>
  );
};

export default Chatpage;
