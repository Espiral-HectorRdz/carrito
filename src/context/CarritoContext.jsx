import React, { createContext, useContext, useState, useEffect } from 'react';

// Crea el contexto
const CarritoContext = createContext();

// Proveedor del contexto
export const CarritoProvider = ({ children }) => {
  
  //SIRVE PARA CONDICIONAR EN LA APP, SEGUN EL PROYECTO QUE ESTÉ TRUE
  const [proyecto, setProyecto] = useState({ klein: false, mercado: true});

  const [funcion, setFuncion] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [cantidadCarrito, setCantidadCarrito] = useState(0);
  const [alerta, setAlerta] = useState(false);
  const [view, setView] = useState(() => {
      const viewStorage = localStorage.getItem("view");
      return viewStorage ? JSON.parse(viewStorage) : { grid: true, row: false };
  });
  
  const [cliente, setCliente] = useState(() => {
    const clienteBase64 = sessionStorage.getItem("cliente");
    return clienteBase64 ? JSON.parse(atob(clienteBase64)) : null;
  });
  const [usuario, setUsuario] = useState(() => {
    const storedUsuario = localStorage.getItem('usuario');
    return storedUsuario ? JSON.parse(storedUsuario) : null;
  });

  const apiURL = "http://espiraldemo.ddns.net:5000";

  //
  useEffect(()=> {
    const viewBase64 = btoa(JSON.stringify(view));
    localStorage.setItem("view", JSON.stringify(view));
  }, [view]);
  

  //almacenar usuario
  useEffect(() => {
    if (usuario) {
        localStorage.setItem('usuario', JSON.stringify(usuario));
    } else {
        localStorage.removeItem('usuario'); // Opcional: Eliminar si no hay usuario
    }
  }, [usuario]);

  // Almacenar el cliente en localStorage como Base64
  useEffect(() => {
    if (cliente) {
      const clienteBase64 = btoa(JSON.stringify(cliente)); // Codificamos a Base64
      sessionStorage.setItem("cliente", clienteBase64);
    } else {
      sessionStorage.removeItem("cliente");
    }
  }, [cliente]);

  // Almacenar el cliente en localStorage como Base64
  useEffect(() => {
    if (funcion) {
      const funcionBase64 = btoa(JSON.stringify(funcion)); // Codificamos a Base64
      localStorage.setItem("funcion", funcionBase64);
    } else {
      localStorage.removeItem("cliente");
    }
  }, [funcion]);
  
  const isBase64 = (str) => {
    try {
      // Expresión regular para validar Base64
      return btoa(atob(str)) === str;
    } catch (e) {
      return false;
    }
  };
  

  useEffect(() => {
    try {
      // Recuperar los datos de localStorage
      const clienteGuardado = sessionStorage.getItem("cliente");
      const carritoGuardado = sessionStorage.getItem("carrito");
      const funcionGuardada = localStorage.getItem("funcion");
  
      // Verificar si los datos están codificados en Base64 y decodificarlos
      if (clienteGuardado) {
        const clienteDecoded = isBase64(clienteGuardado) ? JSON.parse(atob(clienteGuardado)) : JSON.parse(clienteGuardado);
        setCliente(clienteDecoded);
      }
  
      if (carritoGuardado) {
        const carritoDecoded = isBase64(carritoGuardado) ? JSON.parse(atob(carritoGuardado)) : JSON.parse(carritoGuardado);
        setCarrito(carritoDecoded);
      }
      if(funcionGuardada){
        const funcionDecoded = isBase64(funcionGuardada) ? JSON.parse(atob(funcionGuardada)) : JSON.parse(funcionGuardada);
        setFuncion(funcionDecoded);
      }
    } catch (error) {
      console.error('Error al recuperar datos del localStorage:', error);
    }
  }, []);
  
  

  const recuperarCarrito = () => {
    const carritoBase64 = sessionStorage.getItem("carrito");
    if (carritoBase64) {
      const carritoJSON = JSON.parse(atob(carritoBase64));
      return carritoJSON;
    } else {
      return [];  // Si no hay carrito, retornamos un array vacío
    }
  };
  
  useEffect(() => {
    const carritoDesdeStorage = recuperarCarrito();
    setCarrito(carritoDesdeStorage);
  }, []);  // Este efecto solo se ejecuta una vez al montar el componente
  
  /*
  const recuperarCliente = () => {
    const clienteBase64 = sessionStorage.getItem("cliente");
    if (clienteBase64) {
      const clienteJSON = JSON.parse(atob(clienteBase64));
      return clienteJSON;
    } else {
      return [];
    }
  };
  */

  /*
  useEffect(() => {
    const clienteDeStorage = recuperarCliente();
    setCliente(clienteDeStorage);
  }, []);  // Este efecto solo se ejecuta una vez al montar el componente
  */

  
  // Cuenta todos los artículos del carrito
  useEffect(() => {
    const actualizarCant = () => {
      const cantidad = carrito.length;
      setCantidadCarrito(cantidad);
    };
    actualizarCant();
  }, [carrito, setCantidadCarrito]);

{/** 
  const handleAgregar = (producto) => {
  setCarrito(prevCarrito => {
    // Verificamos si el artículo ya existe en el carrito
    const existe = prevCarrito.find(item => item.Articulo_id === producto.Articulo_id);

    const nuevoCarrito = existe
      ? prevCarrito.map(item => {
          if (item.Articulo_id === producto.Articulo_id) {
            // Si el artículo ya existe, actualizamos sus lotes
            const nuevosLotes = producto.lotesArticulos.reduce((acumulador, loteProducto) => {
              // Buscar si el lote ya existe en el carrito
              const loteExistente = item.lotesArticulos.find(lote => lote.artdiscretoid === loteProducto.artdiscretoid);

              if (loteExistente) {
                // Si el lote ya existe, sumamos las cantidades
                acumulador.push({
                  ...loteExistente,
                  cantidadLote: loteExistente.cantidadLote + loteProducto.cantidadLote - 1
                });
              } else {
                // Si el lote no existe, lo agregamos con su cantidadLote original
                acumulador.push({
                  ...loteProducto,
                });
              }

              return acumulador;
            }, []); // Usamos reduce para acumular los lotes actualizados

            // Fusionamos los lotes existentes con los nuevos lotes
            const lotesActualizados = [
              ...item.lotesArticulos,  // Lotes previos
              ...nuevosLotes            // Nuevos lotes procesados
            ];

            // Eliminar duplicados, en caso de que algún lote ya haya sido sumado
            const lotesFinales = lotesActualizados.reduce((acc, lote) => {
              const exists = acc.find(l => l.artdiscretoid === lote.artdiscretoid);
              if (!exists) {
                acc.push(lote); // Solo agregamos el lote si no está ya en el acumulador
              } else {
                // Si el lote existe, sumamos la cantidadLote
                acc = acc.map(l => 
                  l.artdiscretoid === lote.artdiscretoid ? { ...l, cantidadLote: l.cantidadLote + lote.cantidadLote } : l
                );
              }
              return acc;
            }, []);

            return {
              ...item,
              cantGlobal: item.cantGlobal + producto.cantGlobal, // Sumamos la cantidad global
              lotesArticulos: lotesFinales // Actualizamos los lotes
            };
          }
          return item;
        })
      : [
          ...prevCarrito,
          { 
            ...producto, // Inicializamos el artículo con su cantidad y lotes
            lotesArticulos: producto.lotesArticulos.map(lote => ({
              ...lote, // Mantenemos los lotes con su cantidadLote original
            }))
          }
        ];

      // Convertimos el carrito a JSON y luego a Base64
      const carritoBase64 = btoa(JSON.stringify(nuevoCarrito));
      localStorage.setItem('carrito', carritoBase64);

    return nuevoCarrito;
  });

  // Activar alerta de agregado al carrito
  setAlerta(true);
  setTimeout(() => {
    setAlerta(false);
  }, 2000);
};
*/}

const handleAgregar = (producto) => {
  setCarrito(prevCarrito => {
    // Filtramos los lotesArticulos para eliminar aquellos con cantidadLote igual a 0
    const lotesFiltrados = producto.lotesArticulos.filter(lote => lote.cantidadLote > 0);

    // Agregamos el nuevo producto al carrito solo con los lotes filtrados
    const nuevoCarrito = [
      ...prevCarrito,
      {
        ...producto, // Copiamos el producto tal cual
        lotesArticulos: lotesFiltrados // Solo agregamos los lotes que tienen cantidadLote > 0
      }
    ];

    // Convertimos el carrito a JSON y luego a Base64
    const carritoBase64 = btoa(JSON.stringify(nuevoCarrito));
    sessionStorage.setItem("carrito", carritoBase64);

    return nuevoCarrito;
  });

  // Activar alerta de agregado al carrito
  setAlerta(true);
  setTimeout(() => {
    setAlerta(false);
  }, 2000);
};


  

  return (
    <CarritoContext.Provider value={{ 
        carrito,
        setCarrito, 
        cantidadCarrito, 
        setCantidadCarrito,
        alerta,
        setAlerta, 
        handleAgregar,
        view,
        setView, 
        cliente,
        setCliente,
        apiURL,
        usuario, 
        setUsuario,
        funcion,
        setFuncion,
        proyecto
      }}>

      {children}
      
    </CarritoContext.Provider>
  );
};

// Hook para usar el contexto
export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error('useCarrito debe ser usado dentro de un CarritoProvider');
  }
  return context;
};

export default CarritoContext;


