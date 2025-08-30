import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./layouts/layout";
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Perfil from "./pages/perfil";
import Reserva from "./pages/reservas";
import ActividadesPage from "./pages/actividades";

function App(): React.JSX.Element {
  return (
   
      <Routes>
        {/* Todas las rutas usan Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />           {/* / */}
          <Route path="home" element={<Home />} />    {/* /home */}  
          <Route path="perfil" element={<Perfil />} />
          <Route path="reserva" element={<Reserva />} />
          <Route path="actividades" element={<ActividadesPage />} />
        </Route>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Routes>
    
  );
}

export default App; 

