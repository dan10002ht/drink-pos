import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import AdminRoutes from "./routes/AdminRoutes";

function App() {
  return (
    <ChakraProvider>
      <BrowserRouter>
        <AdminRoutes />
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;
