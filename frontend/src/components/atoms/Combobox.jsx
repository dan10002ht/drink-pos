import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Input,
  List,
  ListItem,
  Text,
  useColorModeValue,
  Icon,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { FiSearch, FiX, FiChevronDown } from "react-icons/fi";

const Combobox = ({
  options = [],
  value,
  onChange,
  placeholder = "Tìm kiếm...",
  getOptionLabel = (option) => option.label || option.name || option,
  getOptionValue = (option) => option.value || option.id || option,
  isDisabled = false,
  isClearable = true,
  size = "md",
  maxHeight = "200px",
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBgColor = useColorModeValue("gray.50", "gray.700");
  const shadowColor = useColorModeValue("gray.200", "gray.600");

  // Find selected option based on value
  useEffect(() => {
    if (value) {
      const option = options.find((opt) => getOptionValue(opt) === value);
      setSelectedOption(option || null);
      setSearchValue(option ? getOptionLabel(option) : "");
    } else {
      setSelectedOption(null);
      setSearchValue("");
    }
  }, [value, options, getOptionValue, getOptionLabel]);

  // Filter options based on search
  const filteredOptions = options.filter((option) =>
    getOptionLabel(option).toLowerCase().includes(searchValue.toLowerCase())
  );

  // Handle option selection
  const handleSelectOption = (option) => {
    setSelectedOption(option);
    setSearchValue(getOptionLabel(option));
    setIsOpen(false);
    onChange?.(getOptionValue(option), option);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    setIsOpen(true);

    // If input is cleared, clear selection
    if (!newValue && isClearable) {
      setSelectedOption(null);
      onChange?.(null, null);
    }
  };

  // Handle clear
  const handleClear = () => {
    setSearchValue("");
    setSelectedOption(null);
    setIsOpen(false);
    onChange?.(null, null);
    inputRef.current?.focus();
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredOptions.length > 0) {
        handleSelectOption(filteredOptions[0]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  return (
    <Box ref={containerRef} position="relative" {...props}>
      <InputGroup size={size}>
        <InputLeftElement pointerEvents="none">
          <Icon as={FiSearch} color="gray.400" />
        </InputLeftElement>
        <Input
          ref={inputRef}
          value={searchValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedOption ? getOptionLabel(selectedOption) : placeholder
          }
          isDisabled={isDisabled}
          pr={isClearable && searchValue ? "8" : "10"}
          cursor="pointer"
          readOnly={!isOpen}
          _readOnly={{
            cursor: "pointer",
            bg: "transparent",
          }}
        />
        <InputRightElement>
          {isClearable && searchValue && !isDisabled ? (
            <IconButton
              size="sm"
              variant="ghost"
              icon={<FiX />}
              onClick={handleClear}
              aria-label="Clear"
            />
          ) : (
            <Icon
              as={FiChevronDown}
              color="gray.400"
              transform={isOpen ? "rotate(180deg)" : "rotate(0deg)"}
              transition="transform 0.2s"
            />
          )}
        </InputRightElement>
      </InputGroup>

      {/* Dropdown */}
      {isOpen && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          zIndex={1000}
          bg={bgColor}
          border="1px"
          borderColor={borderColor}
          borderRadius="md"
          boxShadow={`0 4px 6px -1px ${shadowColor}`}
          maxHeight={maxHeight}
          overflowY="auto"
          mt={1}
        >
          <List spacing={0}>
            {filteredOptions.length === 0 ? (
              <ListItem px={4} py={3}>
                <Text color="gray.500" fontSize="sm">
                  Không tìm thấy kết quả
                </Text>
              </ListItem>
            ) : (
              filteredOptions.map((option) => {
                const isSelected =
                  selectedOption &&
                  getOptionValue(selectedOption) === getOptionValue(option);
                return (
                  <ListItem
                    key={getOptionValue(option)}
                    px={4}
                    py={3}
                    cursor="pointer"
                    bg={isSelected ? "blue.50" : "transparent"}
                    color={isSelected ? "blue.600" : "inherit"}
                    _hover={{
                      bg: isSelected ? "blue.50" : hoverBgColor,
                    }}
                    onClick={() => handleSelectOption(option)}
                  >
                    <Text
                      fontSize="sm"
                      fontWeight={isSelected ? "medium" : "normal"}
                    >
                      {getOptionLabel(option)}
                    </Text>
                  </ListItem>
                );
              })
            )}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default Combobox;
