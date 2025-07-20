import React from "react";
import {
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";

const OrderStatsCards = ({ stats }) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
      {stats.map((stat, index) => (
        <Card key={index} bg={bgColor} border="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel color="gray.500">{stat.label}</StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold">
                {stat.value}
              </StatNumber>
              <StatHelpText>
                <StatArrow
                  type={stat.changeType}
                  color={
                    stat.changeType === "increase" ? "green.500" : "red.500"
                  }
                />
                {stat.change} so với tháng trước
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      ))}
    </SimpleGrid>
  );
};

export default OrderStatsCards;
