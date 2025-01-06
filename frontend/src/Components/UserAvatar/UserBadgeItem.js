import { CloseIcon } from "@chakra-ui/icons";
import { Box } from "@chakra-ui/react";
import React from "react";

const UserBadgeItem = ({ user, handleFunction }) => {
  return (
    <Box
      px={2}
      py={1}
      borderRadius="lg"
      m={1}
      mb={2}
      bg="purple.500"
      color="white"
      cursor="pointer"
      display="flex"
      alignItems="center"
      gap={2} // Adds spacing between name and icon
      onClick={handleFunction}
    >
      {user.name}
      <CloseIcon w={3} h={3} />
    </Box>
  );
};

export default UserBadgeItem;
