import React, { useRef, useState, useEffect } from 'react';
import styles from "../inicio/inicio.module.css";
import { useNavigate, useLocation } from 'react-router-dom';
import { useCarrito } from "../../context/CarritoContext";
import { IoIosSearch } from "react-icons/io";
import { BiLogOut } from "react-icons/bi";
import { FaSpinner } from "react-icons/fa6";
import { RiArrowDownSLine } from "react-icons/ri";
import { TbFaceId } from "react-icons/tb";
import { IoMdAdd } from "react-icons/io";
import Consignatarios from './Consignatarios/Consignatarios';



export default function Inicio({ lastRoute }) {
  const { proyecto, funcion, cliente, setCliente, usuario, setUsuario, apiURL, setCarrito, carrito } = useCarrito();
  const [clienteInput, setClienteInput] = useState('');
  const [claveInput, setClaveInput] = useState('');
  const [consignatarioInput, setConsignatarioInput] = useState('');
  const [fechaInput, setFechaInput] = useState('');
  const [obsInput, setObsInput] = useState('');
  const [isClienteListVisible, setIsClienteListVisible] = useState(false);
  const [isClaveListVisible, setIsClaveListVisible] = useState(false);
  const [isConsignatarioVisible, setIsConsignatarioVisible] = useState(false);
  const [selectedClienteIndex, setSelectedClienteIndex] = useState(-1);
  const [selectedClaveIndex, setSelectedClaveIndex] = useState(-1);
  const [selectedConsIndex, setSelectedConsIndex] = useState(-1);
  const [alerta, setAlerta] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pedido, setPedido] = useState("");
  const [showPedidos, setShowPedidos] = useState(false);
  const [encontroCliente, setEncontroCliente] = useState(false);
  const [isConsignatario, setIsConsignatario] = useState(true);
  const [consignatarios, setConsignatarios] = useState([]);
  const [showConsignatario, setShowConsignatario] = useState(false);
  const [recargado, setRecargado] = useState(false);
  const [mostrarInputConsignatario, setMostrarInputConsignatario] = useState(false);

  useEffect(() => {
    if (clienteInput === 'PUBLICO EN GENERAL') {
      setMostrarInputConsignatario(true);
    } else {
      setMostrarInputConsignatario(false);
    }
  }, [clienteInput]);

  useEffect(() => {
    const ClienteGeneral = {
      cliente: 'PUBLICO EN GENERAL',
      cliente_id: '',
      claveCliente: '',
      pedido: '',
      tipoDocto: "OV"
    };
    setClienteInput(ClienteGeneral.cliente);
  }, []);



  useEffect(() => {
    if (carrito.length === 0 && !recargado) {
      setRecargado(true);
    }
  }, [carrito, recargado]);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiURL}/get_catalogos_json/clientes`);
        const data = await res.json();

        if (res.ok) {
          setLoading(false);
          setOptions(data);
        } else {
          console.log('Hubo un error al obtener los clientes');
        }

      } catch (error) {
        console.log("Error de red, o problema al hacer la solicitud", error);
      }
    };

    fetchClientes();
  }, [apiURL]);

  const navigate = useNavigate();
  const location = useLocation();
  const clienteListRef = useRef();
  const claveListRef = useRef();
  const inputRef = useRef();



  useEffect(() => {
    const today = new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = today.toLocaleDateString('es-ES', options);
    setFechaInput(formattedDate);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (clienteListRef.current && !clienteListRef.current.contains(event.target)) {
        setIsClienteListVisible(false);
      }
      if (claveListRef.current && !claveListRef.current.contains(event.target)) {
        setIsClaveListVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  console.log(consignatarioInput);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Buscar cliente en las opciones
    const exist = options.filter(option => option.nombre.toLowerCase() === clienteInput.toLowerCase());

    // Determinar la ruta de navegación
    const ruta = cliente ? window.history.back() : "/grupos";

    // Validación: si el proyecto es "klein" y la función es "mesero", se debe elegir un tipo de pedido
    if (proyecto.klein && funcion === "mesero" && pedido === "") {
      setAlerta("Debes elegir un tipo de pedido");
      setTimeout(() => {
        setAlerta("");
      }, 2000);
      return;
    }

    // Validación: si se debe mostrar el input de consignatario y está vacío, mostrar alerta
    if (mostrarInputConsignatario && consignatarioInput === '') {
      alert('consignatario obligatorio')
      /*setAlerta('Debes agregar un consignatario');
      setTimeout(() => {
        setAlerta(false);
      }, 2000);
      */
      return;
    }

    // Validación: si no se debe mostrar el input de consignatario, verificar los otros campos
    if (!mostrarInputConsignatario && (claveInput === '' || clienteInput === '')) {
      alert('error');
      return;
    }

    // Validación de cliente (si existe o es "PUBLICO EN GENERAL")
    if (exist.length > 0 || clienteInput === 'PUBLICO EN GENERAL') {
      const nuevoCliente = {
        cliente: (exist.length > 0 && exist[0].nombre) || 'PUBLICO EN GENERAL',
        cliente_id: (exist.length > 0 && exist[0].clienteid) || '',
        obs: obsInput || '',  // Si no hay observaciones, se asigna una cadena vacía
        claveCliente: (exist.length > 0 && exist[0].clavecliente) || '',
        pedido: pedido || '',  // Si no hay pedido, se asigna una cadena vacía
        tipoDocto: "OV",
        consignatario: consignatarioInput
      };

      // Guardar cliente en el estado y en sessionStorage
      setCliente(nuevoCliente);
      sessionStorage.setItem('cliente', JSON.stringify(nuevoCliente));
      sessionStorage.setItem("existeCliente", "true");

      // Navegar a la ruta determinada
      navigate(ruta);
      scrollToTop();
      setAlerta("");
    } else {
      setAlerta("Cliente no válido, intenta de nuevo");
      setTimeout(() => {
        setAlerta("");
      }, 2000);
    }
  };


  const handleSearchClienteClick = () => {
    if (clienteInput) {
      const coincide = options.filter(option => option.nombre.toLowerCase().includes(clienteInput.toLowerCase()));
      setIsClienteListVisible(coincide.length > 0);
      setSelectedClienteIndex(-1);
    }
  };

  const handleSearchClaveClick = () => {
    if (claveInput) {
      const coincide = options.filter(option =>
        option.clavecliente && option.clavecliente.toLowerCase().includes(claveInput.toLowerCase()) // Solo filtra si `clavecliente` existe
      );
      setIsClaveListVisible(coincide.length > 0);
      setSelectedClaveIndex(-1);
      inputRef.current.focus();
    }
  };

  const handleClienteOptionClick = (option) => {
    setClaveInput(option.clavecliente || ''); // Si no tiene clavecliente, no la asigna
    setClienteInput(option.nombre);
    setIsClienteListVisible(false);
    setEncontroCliente(true);
  };

  const handleClaveOptionClick = (option) => {
    setClienteInput(option.nombre);
    setClaveInput(option.clavecliente || ''); // Si no tiene clavecliente, no la asigna
    setIsClaveListVisible(false);
    setEncontroCliente(true);
  };

  const handleKeyDown = (e) => {
    const filteredClienteOptions = options.filter(option => option.nombre.toLowerCase().includes(clienteInput.toLowerCase()));
    const filteredClaveOptions = options.filter(option =>
      option.clavecliente && option.clavecliente.toLowerCase().includes(claveInput.toLowerCase()) // Solo filtra si `clavecliente` existe
    );

    if (isClienteListVisible) {
      if (e.key === 'ArrowDown' || e.key === "Tab") {
        setSelectedClienteIndex((prevIndex) => (prevIndex + 1) % filteredClienteOptions.length);
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        setSelectedClienteIndex((prevIndex) => (prevIndex - 1 + filteredClienteOptions.length) % filteredClienteOptions.length);
        e.preventDefault();
      } else if (e.key === 'Enter' && selectedClienteIndex >= 0) {
        handleClienteOptionClick(filteredClienteOptions[selectedClienteIndex]);
        e.preventDefault();
      }
    }

    if (isClaveListVisible) {
      if (e.key === 'ArrowDown' || e.key === "Tab") {
        setSelectedClaveIndex((prevIndex) => (prevIndex + 1) % filteredClaveOptions.length);
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        setSelectedClaveIndex((prevIndex) => (prevIndex - 1 + filteredClaveOptions.length) % filteredClaveOptions.length);
        e.preventDefault();
      } else if (e.key === 'Enter' && selectedClaveIndex >= 0) {
        handleClaveOptionClick(filteredClaveOptions[selectedClaveIndex]);
        e.preventDefault();
      }
    }

    if (e.key === 'Enter') {
      handleSearchClienteClick();
      handleSearchClaveClick();
      handleBuscarConsignatario();
      e.preventDefault();
    }
  };

  const handleCerrarSesion = () => {
    setUsuario(null);
    localStorage.removeItem("existeUsuario");
    localStorage.removeItem("funcion");
    navigate("/login");
    setCarrito([]);
    localStorage.removeItem("carrito");
    sessionStorage.removeItem("cliente");
    sessionStorage.removeItem("existeCliente");
  };

  const handleRegresar = () => {
    window.history.back();
  }

  // Maneja el clic en una opción
  const handleChange = (value) => {
    setPedido(value);
    setShowPedidos(false)
  };


  //verifica que si el usuario una vez que metio un cliente, decide
  //limpiar los inputs y poner otro se setea EncontroCliente 
  //para que los inputs adicionales se vuelvan a mostrar por si no encuentra el cliente
  //lo registre
  useEffect(() => {
    if (claveInput === "" && clienteInput === "") {
      setEncontroCliente(false);
    }
  }, [claveInput, clienteInput]);


  const consignatariosArray = [
    'Juan Pérez',
    'Ana Gómez',
    'Carlos Martínez',
    'Sofia Rodríguez',
    'Hector Manuel'
  ];

  const handleBuscarConsignatario = () => {
    const coincidencias = consignatariosArray.filter(consig =>
      consig.toLowerCase().includes(consignatarioInput.toLowerCase())
    );

    if (coincidencias.length > 0) {
      setConsignatarios(coincidencias);
      setIsConsignatario(true);
      setIsConsignatarioVisible(true);
    } else {
      setConsignatarios([]);
      setIsConsignatario(false);
      setIsClienteListVisible(false);
    }
  };

  return (
    <>
      <div className='overlay'></div>
      <div className={styles.inicio_container}>

        {
          showConsignatario ? (
            <Consignatarios
              setShowConsignatario={setShowConsignatario}
              setConsignatarioInput={setConsignatarioInput}
            />
          ) : (
            <form onSubmit={handleSubmit} className={"modal"}>
              <h3>
                {
                  proyecto.klein ? (
                    "Pedido"
                  ) : proyecto.mercado && (
                    "Cliente"
                  )
                }
              </h3>
              <div className={styles.div_usuario}>
                {
                  cliente ? (
                    <>
                      <p>Regresar</p>
                      <p onClick={handleRegresar}><BiLogOut /></p>
                    </>
                  ) : (
                    <>
                      <p>Usuario: <span>{usuario.toUpperCase()}</span></p>
                      <p onClick={handleCerrarSesion}><BiLogOut /></p>
                    </>
                  )
                }

              </div>

              {
                loading ? (
                  <div className={styles.div_cargando}>
                    <p className={styles.cargando}><FaSpinner /></p>
                  </div>
                ) : (
                  <div className={styles.div_form}>
                    {/* Clave  */}
                    <div className={styles.div_cliente}>
                      <label htmlFor="clave">Clave: </label>
                      <input
                        ref={inputRef}
                        type="text"
                        id="clave"
                        value={claveInput}
                        onChange={(e) => setClaveInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoComplete="off"
                      />
                      <p className={styles.buscar} onClick={handleSearchClaveClick}>
                        <IoIosSearch />
                      </p>
                      {isClaveListVisible && claveInput && (
                        <ul className={styles.lista_clientes} ref={claveListRef}>
                          {options.filter(option =>
                            option.clavecliente && option.clavecliente.toLowerCase().includes(claveInput.toLowerCase()) // Solo muestra aquellos con `clavecliente`
                          ).map((filteredOption, index) => (
                            <li
                              key={index}
                              onClick={() => handleClaveOptionClick(filteredOption)}
                              className={selectedClaveIndex === index ? styles.selected : ''}
                            >
                              {filteredOption.clavecliente}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {/* Cliente Field */}
                    <div className={styles.div_cliente}>
                      <label htmlFor="cliente">Cliente: </label>
                      <input
                        ref={inputRef}
                        type="text"
                        id="cliente"
                        value={clienteInput}
                        onChange={(e) => setClienteInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoComplete="off"
                      />
                      <p className={styles.buscar} onClick={handleSearchClienteClick}>
                        <IoIosSearch />
                      </p>
                      {isClienteListVisible && clienteInput && (
                        <ul className={styles.lista_clientes} ref={clienteListRef}>
                          {options.filter(option =>
                            option.nombre.toLowerCase().includes(clienteInput.toLowerCase())
                          ).map((filteredOption, index) => (
                            <li
                              key={filteredOption.clienteid}
                              onClick={() => handleClienteOptionClick(filteredOption)}
                              className={selectedClienteIndex === index ? styles.selected : ''}
                            >
                              {filteredOption.nombre}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Consignatario Field */}
                    {
                      proyecto.mercado && mostrarInputConsignatario && (
                        <div className={styles.div_cliente}>
                          <label htmlFor="consignatario">Consignatario: </label>
                          <input
                            style={{ width: "11.2rem" }}
                            ref={inputRef}
                            type="text"
                            id="consignatario"
                            autoComplete="off"
                            value={consignatarioInput}
                            onKeyDown={handleKeyDown}
                            onChange={(e) => {
                              setConsignatarioInput(e.target.value.toUpperCase());
                              setIsConsignatario(true);
                              setConsignatarios([]);
                            }}
                          />


                          <p onClick={() => setShowConsignatario(true)} className={styles.add}>
                            <IoMdAdd />
                          </p>

                          <p onClick={handleBuscarConsignatario} className={styles.buscar}>
                            <IoIosSearch />
                          </p>


                          {/* Mostrar los resultados debajo del input */}
                          {consignatarios.length > 0 && isConsignatarioVisible && (
                            <ul className={styles.lista_clientes}>
                              {consignatarios.map((item, index) => (
                                <li
                                  onClick={(e) => {
                                    setConsignatarioInput(item.toUpperCase());
                                    setIsConsignatarioVisible(false);
                                  }}
                                  key={index}>{item}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )
                    }


                    {/*SECCION SOLO DISPONIBLE PARA PROYECTO KLEIN*/}
                    {
                      proyecto.klein && (
                        <>

                          {
                            !encontroCliente && (
                              <>
                                <div>
                                  <label htmlFor="dom">Domicilio</label>
                                  <input id='dom' type="text" />
                                </div>
                                <div>
                                  <label htmlFor="num">Numero</label>
                                  <input id='num' type="tel" />
                                </div>
                              </>
                            )
                          }


                          {!showPedidos && (<p onClick={() => setShowPedidos(true)} className={styles.tipo_pedido}><span><RiArrowDownSLine /></span> Tipo pedido: <span style={{ fontWeight: "bold" }}>{pedido ? pedido : "Elegir"}</span></p>)}

                          {
                            funcion === "mesero" && showPedidos && (
                              <div className={styles.div_pedidos}>
                                {/* Opción Comedor */}
                                <label
                                  onClick={() => handleChange("Comedor")} // Actualiza el estado a "comedor"
                                  className={`${styles.comedor_option}`} // Aplica clase 'selected' si es la opción seleccionada
                                  htmlFor="comedor"
                                >
                                  <input
                                    name="option"
                                    id="comedor"
                                    type="radio"
                                    checked={pedido === "Comedor"} // Marca el radio si es la opción seleccionada
                                    onChange={() => handleChange("Comedor")}
                                  />
                                  <p>Comedor</p>
                                </label>

                                {/* Opción Domicilio */}
                                <label
                                  onClick={() => handleChange("Domicilio")} // Actualiza el estado a "domicilio"
                                  className={`${styles.domicilio_option}`} // Aplica clase 'selected' si es la opción seleccionada
                                  htmlFor="domicilio"
                                >
                                  <input
                                    name="option"
                                    id="domicilio"
                                    type="radio"
                                    checked={pedido === "Domicilio"} // Marca el radio si es la opción seleccionada
                                    onChange={() => handleChange("Domicilio")}
                                  />
                                  <p>Domicilio</p>
                                </label>

                                {/* Opción Pasa */}
                                <label
                                  onClick={() => handleChange("Pasa")} // Actualiza el estado a "pasa"
                                  className={`${styles.pasa_option}`} // Aplica clase 'selected' si es la opción seleccionada
                                  htmlFor="pasa"
                                >
                                  <input
                                    name="option"
                                    id="pasa"
                                    type="radio"
                                    checked={pedido === "Pasa"} // Marca el radio si es la opción seleccionada
                                    onChange={() => handleChange("Pasa")}
                                  />
                                  <p>Pasa</p>
                                </label>

                                {/* Opción venta directa */}
                                <label
                                  onClick={() => handleChange("Venta Directa")} // Actualiza el estado a "pasa"
                                  className={`${styles.directa_option}`} // Aplica clase 'selected' si es la opción seleccionada
                                  htmlFor="directa"
                                >
                                  <input
                                    name="option"
                                    id="directa"
                                    type="radio"
                                    checked={pedido === "Venta Directa"} // Marca el radio si es la opción seleccionada
                                    onChange={() => handleChange("Venta Directa")}
                                  />
                                  <p>Venta directa</p>
                                </label>
                              </div>
                            )
                          }
                          {
                            funcion === "autoServicio" && showPedidos && (
                              <div className={styles.div_pedidos}>
                                {/* Opción Comedor */}
                                <label
                                  onClick={() => handleChange("Comer aquí")} // Actualiza el estado a "comedor"
                                  className={`${styles.comedor_option}`} // Aplica clase 'selected' si es la opción seleccionada
                                  htmlFor="comedor"
                                >
                                  <input
                                    name="option"
                                    id="comedor"
                                    type="radio"
                                    checked={pedido === "Comer aquí"} // Marca el radio si es la opción seleccionada
                                    onChange={() => handleChange("Comer aquí")}
                                  />
                                  <p>Comer Aquí</p>
                                </label>

                                {/* Opción Pasa */}
                                <label
                                  onClick={() => handleChange("Para llevar")} // Actualiza el estado a "pasa"
                                  className={`${styles.pasa_option}`} // Aplica clase 'selected' si es la opción seleccionada
                                  htmlFor="pasa"
                                >
                                  <input
                                    name="option"
                                    id="pasa"
                                    type="radio"
                                    checked={pedido === "Para llevar"} // Marca el radio si es la opción seleccionada
                                    onChange={() => handleChange("Para llevar")}
                                  />
                                  <p>Para llevar</p>
                                </label>

                              </div>
                            )
                          }

                        </>
                      )
                    }

                    <div className={styles.div_observaciones}>
                      <label htmlFor="obs">Observaciones: </label>
                      <textarea className={styles.textarea} value={obsInput} onChange={(e) => setObsInput(e.target.value)} id="obs"></textarea>
                    </div>
                    {alerta !== "" && (
                      <div className={`${styles.alerta_cliente} ${alerta ? styles.mostrar_alerta : ""}`}>
                        <p>{alerta}</p>
                      </div>
                    )}
                    <button type="submit">Entrar</button>
                  </div>
                )
              }


            </form >
          )
        }

      </div >
    </>
  );
}
