import React, { useEffect, useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { CarritoProvider } from './context/CarritoContext';
import { useCarrito } from './context/CarritoContext';
import { useNavigate } from 'react-router-dom';

// Lazy loading de componentes
const Nav = React.lazy(() => import('./components/nav/Nav'));
const Grupos = React.lazy(() => import('./components/grupos/Grupos'));
const Menu = React.lazy(() => import('./components/menu/Menu'));
const Carrito = React.lazy(() => import("./components/carrito/Carrito"));
const Lineas = React.lazy(() => import('./components/lineas/Lineas'));
const Articulos = React.lazy(() => import("./components/articulos/Articulos"));
const Inicio = React.lazy(() => import("./components/inicio/Inicio"));
const Todos = React.lazy(() => import('./components/todos/Todos'));
const Login = React.lazy(() => import('./components/login/Login'));
const OrdenCompra = React.lazy(() => import('./components/ordenCompra/OrdenCompra'));
const Funcion = React.lazy(() => import('./components/funcion/Funcion'));
const TipoDocto = React.lazy(() => import('./components/tipoDocto/TipoDocto'));
import Inactividad from './components/inactividad/Inactividad';

// Componente Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error(error, errorInfo);
  }
  

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children; 
  }
}

function App() {
  return (
    <CarritoProvider>
      <Router>
        <Main />
      </Router>
    </CarritoProvider>
  );
}

const Main = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeComponent, setActiveComponent] = useState(null);
  const [redirect, setRedirect] = useState(false);
  const [redirectLogin, setRedirectLogin] = useState(false);
  const [redirectFuncion, setRedirecFuncion] = useState(false);
  const { funcion, proyecto, setCarrito, setUsuario } = useCarrito();

  useEffect(() => {
    const existeCliente = sessionStorage.getItem("existeCliente") === "true";
    const existeUsuario = localStorage.getItem("existeUsuario") === "true";
    
    // Si no hay usuario, redirigir a /login
    if (!existeUsuario) {
      setRedirectLogin(location.pathname !== "/login");
    } else {
      setRedirectLogin(false);
      // Si hay usuario pero no hay cliente, redirigir a /
      if (!existeCliente && funcion === "" && proyecto.klein) {
        setRedirecFuncion(location.pathname !== "/funcion");
      } else {
        setRedirecFuncion(false);
        if (!existeCliente) {
          setRedirect(location.pathname !== "/");
        } else {
          setRedirect(false);
        }
      }
    }
  }, [location.pathname, funcion]);

  if (redirectLogin) {
    return <Navigate to="/login" replace />;
  } else if (redirectFuncion) {
    return <Navigate to="/funcion" replace />;
  } else if (redirect) {
    return <Navigate to="/" replace />;
  }

  const cerrarSesion = () => {
    setUsuario(null);
    localStorage.removeItem("existeUsuario");
    localStorage.removeItem("funcion");
    navigate("/login");
    setCarrito([]);
    sessionStorage.removeItem("carrito");
    sessionStorage.removeItem("cliente");
    sessionStorage.removeItem("existeCliente");
    window.location.reload();
  };

  const existeUsuario = localStorage.getItem("existeUsuario") === "true";

  return (
    <>
      <ErrorBoundary>
        <Suspense fallback={<div>Loading...</div>}>
          <Nav activeComponent={activeComponent} setActiveComponent={setActiveComponent} />
          <Inactividad cerrarSesion={cerrarSesion} />
          <Routes>
            <Route path='/login' element={existeUsuario ? ( <Grupos /> ) : ( <Login/> )} />
            <Route path="/" element={<Inicio />} />
            <Route path="/ordenCompra" element={<OrdenCompra />} />
            <Route path="/grupos" element={<Grupos />} />
            <Route path="/todos" element={<Todos />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/lineas" element={<Lineas />} />
            <Route path="/articulos" element={<Articulos />} />
            <Route path="/busqueda/:searchTerm" element={<Articulos />} />
            <Route path='/funcion' element={<Funcion />} />
            <Route path='/tipodocto' element={<TipoDocto />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </>
  );
};

export default App;
