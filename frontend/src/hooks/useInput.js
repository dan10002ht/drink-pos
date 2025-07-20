import { useState } from "react";

export function useInput(initialValue = {}) {
  const [value, setValue] = useState(initialValue);
  const handleChangeInput = (key, value) => {
    setValue((prev) => ({ ...prev, [key]: value }));
  };
  return { value, handleChangeInput, setValue };
}
