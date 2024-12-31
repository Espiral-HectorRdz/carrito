import React, { useEffect, useState, useRef } from 'react';
import styles from "../modal/modal.module.css";
import { IoMdClose } from "react-icons/io";
import { MdAddShoppingCart } from "react-icons/md";
import { useCarrito } from "../../context/CarritoContext";
import ModalLotes from './modalLotes/ModalLotes';
import ModalNotas from './modalNotas/ModalNotas';
import ModalFoto from './modalFoto/ModalFoto'
import { FaSpinner } from "react-icons/fa6";
import { SlNotebook } from "react-icons/sl";
import { MdMoreVert } from "react-icons/md";


export default function Modal({
  articuloCarrito,
  closeModal,
  setModal,
  articuloEditando
}) {

  const { apiURL, proyecto, handleAgregar, carrito, setCarrito } = useCarrito();
  const [lotes, setLotes] = useState([]);
  const [cantidadPorLote, setCantidadPorLote] = useState({});
  const [mostrarModalLotes, setMostrarModalLotes] = useState(false);
  const [showAgregarNotas, setShowAgregarNotas] = useState(false);
  const [ejemplo, setEjemplo] = useState({ ejemplo1: false, ejemplo2: true, ejemplo3: false });
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  const [lote, setLote] = useState("");
  const inputRefs = useRef({});
  const [alertaModal, setAlertaModal] = useState(null);//variable para activar o desactivar alerta de modal
  const [loading, setLoading] = useState(true);
  const [showOpciones, setShowOpciones] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [precioArticulo, setPrecioArticulo] = useState(0);
  const [descuento, setDescuento] = useState(0);
  const [notas, setNotas] = useState("");
  const [total, setTotal] = useState(0);
  const [lotesArticulos, setLotesArticulos] = useState([]);
  const [showModalFoto, setShowModalFoto] = useState(false);
  const [image, setImage] = useState(null);
  const [esKit, setEsKit] = useState(false);
  const [guardoFoto, setGuardoFoto] = useState(false);


  useEffect(()=>{
    if(articuloEditando){
      if(articuloEditando.notas){
        setNotas(articuloEditando.notas);
      }
    }
  }, []);

  useEffect(() => {
    fetch(`${apiURL}/get_lotes_json/${articuloCarrito.articuloid}`)
      .then(res => res.json())
      .then(data => {
        setLotes(data)
        setLoading(false)
      });
  }, [apiURL, articuloCarrito.articuloid]);

  const formatearFecha = (fecha) => {
    const fechaObj = new Date(fecha); // Convierte la fecha a un objeto Date
    return fechaObj.toLocaleDateString('es-ES'); // Devuelve la fecha en formato 'dd/mm/yyyy'
  };

  /*funcion que calcula el precio de
      articulo por su cantidad*/
  useEffect(() => {
    const precioConDescuento = precioArticulo - ((precioArticulo * descuento) / 100);
    setTotal(precioConDescuento * cantidad);
  }, [cantidad, precioArticulo, descuento]);

  useEffect(() => {
    if (articuloEditando) {
      setCantidad(articuloCarrito.cantGlobal);
      setPrecioArticulo(articuloCarrito.precioArticulo);
    }
  }, []);



  /*funcion para agregar al carrito desde
      el modal del articulo*/
  const handleSubmit = (e) => {
    e.preventDefault();
    const cantidadIsEmty = cantidad === "";
    if (cantidad <= 0 && cantidadIsEmty) {
      setAlertaModal("Cantidad no puede ir vacío");
      setTimeout(() => {
        setAlertaModal(null);
      }, 2000);
      return;
    } else if (precioArticulo === "" || precioArticulo < 1) {
      setAlertaModal("Precio no puede ir vacío");
      setTimeout(() => {
        setAlertaModal(null);
      }, 2000);
      return;
    } else if (descuento === "") {
      setAlertaModal("Descuento no puede ir vacío");
      setTimeout(() => {
        setAlertaModal(null);
      }, 2000);
      return;
    } else if (isNaN(cantidad) || isNaN(descuento) || isNaN(precioArticulo)) {
      setAlertaModal("Los valores ingresados deben ser numeros");
      setTimeout(() => {
        setAlertaModal(null);
      }, 2000);
      return;
    }

    const itemToAdd = {
      ...articuloCarrito,
      cantidad,
      "cantGlobal": cantidad,
      notas,
      precioArticulo,
      descuento,
      lotesArticulos,
      foto: image
    };
    setLotesArticulos([]);
    handleAgregar(itemToAdd);
    setModal(false);
    setNotas("");
    setCantidad(1);
    setDescuento(0);
    setPrecioArticulo("");
    setImage(null);
  };

  const handleGuardarArticulo = (e, item) => {
    e.preventDefault();
    const cantidadIsEmty = cantidad === "";
    if (cantidad <= 0 && cantidadIsEmty) {
      setAlertaModal("Cantidad no puede ir vacío");
      setTimeout(() => {
        setAlertaModal(null);
      }, 2000);
      return;
    } else if (precio === "" || precio < 1) {
      setAlertaModal("Precio no puede ir vacío");
      setTimeout(() => {
        setAlertaModal(null);
      }, 2000);
      return;
    } else if (descuento === "") {
      setAlertaModal("Descuento no puede ir vacío");
      setTimeout(() => {
        setAlertaModal(null);
      }, 2000);
      return;
    }

    // Calcular la suma de las cantidades de los lotes editados
    const sumaLotes = lotesArticulos.reduce((total, lote) => total + lote.cantidadLote, 0);

    // Verificar si la suma de las cantidades de los lotes no sobrepasa la cantidad total
    if (articuloEditando.lotesArticulos.length !== 0 && sumaLotes !== Number(cantidad)) {
      // Si la suma es mayor a la cantidad total, mostrar un mensaje de error
      alert('La suma de las cantidades de los lotes no puede ser diferente a la cantidad total del artículo.');
      setLotesArticulos([]);
      return;
    }

    const lotesfiltrados = lotesArticulos.filter(lote => lote.cantidadLote > 0);


    // Si la validación pasa, procedemos a editar el artículo en el carrito
    let editado;
    
    
      editado = carrito.map((articulo) =>
        articuloEditando.articuloid === articulo.articuloid
          ? {
            ...articulo,
            notas: notas.trim(),
            precioArticulo,
            descuento,
            cantGlobal: cantidad,
            lotesArticulos: lotesfiltrados,
            foto: articuloEditando.foto ? articuloEditando.foto : image
          }
          : articulo
      );
    
    



    // Codificamos el carrito a Base64 antes de almacenarlo
    const carritoBase64 = btoa(JSON.stringify(editado));

    // Guardamos el carrito codificado en Base64 en localStorage
    sessionStorage.setItem("carrito", carritoBase64);

    // Establecer el carrito actualizado en el estado
    setCarrito(editado);

    // Limpiar los campos y cerrar la ventana de edición
    setNotas("");
    setCantidadPorLote({});
    closeModal();
  };
  
  const changeLote = (lote) => {
    setLoteSeleccionado(lote);  // Cambia el lote seleccionado
    setLote(lote);              // Cambia el lote activo
  };


  const handleCantidadLoteChange = (nomalmacen, artdiscretoid, loteClave, value) => {

    // Encuentra el lote correspondiente
    const lote = lotes.find(l => l.clave === loteClave);


    // Verifica que el lote exista y que el valor sea válido
    if (lote && value <= lote.existencia) {
      // Actualiza cantidad por lote
      setCantidadPorLote(prev => ({
        ...prev,
        [loteClave]: value
      }));

      // Actualiza lotesArticulos
      setLotesArticulos(prev => {
        // Encuentra el índice de `artdiscretoid` en el estado `prev`
        const index = prev.findIndex(item => item.artdiscretoid === artdiscretoid);

        if (index === -1) {
          // Si no existe, agrega un nuevo loteArticulo
          return [
            ...prev,
            { nomalmacen, artdiscretoid, "cantidadLote": value, "clave": loteClave }
          ];
        } else {
          // Si ya existe, actualiza la cantidad
          const newLotesArticulos = [...prev];
          newLotesArticulos[index] = { ...newLotesArticulos[index], cantidadLote: value };
          return newLotesArticulos;
        }
      });
    } else {
      console.warn("Cantidad no válida para este lote");
    }
  };


  const calcularTotalCantidadSeleccionada = () => {
    return Object.values(cantidadPorLote).reduce((acc, curr) => acc + curr, 0);
  };


  const esCantidadValida = calcularTotalCantidadSeleccionada() === Number(cantidad);


  const formatearCantidad = (cantidad) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(cantidad);
  };

  // Función para abrir el modal de lotes
  const abrirModalLotes = () => {
    setMostrarModalLotes(true);
  };

  // Función para cerrar el modal de lotes
  const cerrarModalLotes = () => {
    setMostrarModalLotes(false);
  };

  // Función para dar foco al input
  const handleDivClick = (lote) => {
    // Da foco al input del lote correspondiente
    if (inputRefs.current[lote.clave]) {
      inputRefs.current[lote.clave].focus();
    }
  };



  const handleClick = (e, lote) => {
    e.stopPropagation();
    handleDivClick(lote);
    changeLote(lote);

    // Calculamos la cantidad restante antes de usarla
    const cantidadRestante = cantidad - Object.values(cantidadPorLote).reduce((acc, val) => acc + val, 0);

    if (inputRefs.current[lote.clave]) {
      // Si la cantidad restante es mayor que 0, asignamos esa cantidad al lote
      const cantidadAsignada = cantidadRestante > 0
        ? Math.min(lote.existencia, cantidadRestante)
        : 0;

      // Actualizamos el estado cantidadPorLote con la cantidad asignada
      setCantidadPorLote((prevState) => ({
        ...prevState,
        [lote.clave]: Number(cantidadAsignada), // Usamos la clave del lote como llave y la cantidad como valor
      }));

      // Solo actualizar el valor del input si es necesario para evitar que el input se descontrole
      if (inputRefs.current[lote.clave].value !== cantidadAsignada) {
        inputRefs.current[lote.clave].value = cantidadAsignada;
      }
    }

    // Actualiza lotesArticulos
    setLotesArticulos(prev => {
      // Encuentra el índice de `artdiscretoid` en el estado `prev`
      const index = prev.findIndex(item => item.artdiscretoid === lote.artdiscretoid);

      if (index === -1) {
        // Si no existe, agrega un nuevo loteArticulo
        return [
          ...prev,
          {
            nomalmacen: lote.nomalmacen,
            artdiscretoid: lote.artdiscretoid,
            cantidadLote: cantidadRestante > 0 ? Math.min(lote.existencia, cantidadRestante) : 0,
            clave: lote.clave
          }
        ];
      } else {
        // Si ya existe, actualiza la cantidad
        const newLotesArticulos = [...prev];
        newLotesArticulos[index] = {
          ...newLotesArticulos[index],
          cantidadLote: cantidadRestante > 0 ? Math.min(lote.existencia, cantidadRestante) : 0
        };
        return newLotesArticulos;
      }
    });
  };




  const verificarCantidadRestante = () => {
    const valor = cantidad - calcularTotalCantidadSeleccionada();

    if (valor > 0) {
      return formatearCantidad(valor);
    }
    return "Cantidad exedida";
  }

  const inputClick = () => {
    if (inputRefs.current) {
      inputRefs.current.select();
    }
  }

  return (
    <>
      <div className="overlay" />
      <div className={styles.container}>
        <form className={styles.modal} onSubmit={articuloEditando ? handleGuardarArticulo : handleSubmit}>

          <div className={styles.articulo_nombre}>
            <h5>{articuloCarrito.nombre}</h5>
            <p onClick={closeModal} className={styles.btn_cerrar}>
              <IoMdClose />
            </p>
          </div>
          {
            loading ? (
              <div className={styles.div_cargando}>
                <p className={styles.cargando}><FaSpinner /></p>
              </div>
            ) : !esKit ? (

              <div className={styles.div_modal}>
                <div className={styles.contenido}>

                  {/*Boton Agregar opciones*/}
                  <div className={styles.div_agregar_opcion}>
                    <p className={styles.boton_opciones} onClick={() => setShowOpciones(prev => !prev)} title='Más opciones'><MdMoreVert /></p>
                    {
                      showOpciones && (
                        <div className={styles.div_opciones}>
                          <div>
                            <p onClick={() => {
                              setShowAgregarNotas(true);
                              setShowOpciones(false);
                            }}>Agregar Nota</p>
                          </div>
                          <div>
                            <p onClick={() => setShowModalFoto(true)}>Tomar foto</p>
                          </div>
                        </div>
                      )
                    }
                  </div>


                  {/*
                    articuloCarrito.imagen && (
                      <img className={styles.articulo_img} src={articuloCarrito.imagen} alt="" />
                    )
                  */}

                  {/*
                    <p className={styles.articulo_descripcion}>
                      {articuloCarrito.descripcion}
                    </p>
                  */}


                  {/*TOTAL EN TIEMPO REAL DEL ARTICULO, DEPENDIENDO DE LA CANT, PRECIO Y DESCUENTO*/}
                  <div className={styles.total}>
                    <h3>Total: $<span>{formatearCantidad(total)}</span></h3>
                  </div>

                  {/*CAMPOS MERCADO CANTIDAD, PRECIO, DESCUENTO*/}
                  {
                    proyecto.mercado && (
                      <div className={styles.div_campos}>
                        <div>
                          <label htmlFor="cantidad">Cantidad:</label>
                          {/*<fieldset>
                          <p className={styles.sumar_button} onClick={()=> cantidad !== 1 && setCantidad(cantidad - 1)}>-</p>
                          */}<input
                            type="number"
                            inputMode='decimal'
                            onFocus={(e) => e.target.select()}
                            required
                            step="0.01"
                            id="cantidad"
                            min={1}
                            value={cantidad}
                            onChange={(e) => setCantidad(e.target.value)}
                            autoComplete="off"
                          />
                          {/*<p className={styles.restar_button} onClick={()=>setCantidad(cantidad + 1)}>+</p>
                        </fieldset>
                        */}
                        </div>

                        <div className={styles.div_precio}>
                          <label htmlFor='precio'>Precio:</label>
                          <input
                            inputMode='decimal'
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => setPrecioArticulo(e.target.value)}
                            id='precio'
                            value={`${precioArticulo}`}
                            type="number"
                            step="0.01"
                            autoComplete="off"
                          />
                        </div>

                        <div>
                          <label htmlFor='dcto'>Descuento:</label>
                          <input
                            inputMode='decimal'
                            onFocus={(e) => e.target.select()}
                            id='dcto'
                            onChange={(e) => setDescuento(e.target.value)}
                            value={descuento}
                            type="number"
                            step="0.01"
                            autoComplete="off"
                          />
                        </div>
                      </div>
                    )
                  }


                  {/*CAMPOS KLEIN CANTIDAD PRECIO*/}
                  {
                    proyecto.klein && (
                      <div className={styles.div_campos}>
                        <div>
                          <label htmlFor="cantidad">Cantidad:</label>
                          <fieldset>
                            <p className={styles.restar_button} onClick={() => cantidad !== 1 && setCantidad(cantidad - 1)}>-</p>
                            <input
                              type="number"
                              step="0.01"
                              id="cantidad"
                              min={1}
                              value={cantidad}
                              onChange={(e) => setCantidad(e.target.value)}
                              autoComplete="off"
                            />
                            <p className={styles.sumar_button} onClick={() => setCantidad(cantidad + 1)}>+</p>
                          </fieldset>
                        </div>

                        <div className={styles.div_precio}>
                          <label htmlFor='precio'>Precio:</label>
                          <p>${formatearCantidad(precioArticulo)}</p>
                        </div>
                      </div>
                    )
                  }


                  {/*MENSAJE DE AVISO SI YA HAS SELECCIONADO LOTES, EN CASO DE TENERLOS*/}
                  {
                    lotes.length !== 0 && (
                      <>
                        {
                          cantidad !== "" && (
                            lotes.length !== 0 && !esCantidadValida ? (
                              <p style={{ color: "var(--color-rojo)", border: "solid 1px red", padding: ".3rem", borderRadius: ".3rem", lineHeight: ".9", textAlign: "center", fontWeight: "bold", maxWidth: "350px", margin: "0 auto" }}>Selecciona de los lotes: {verificarCantidadRestante()}</p>
                            ) : (
                              <p style={{ color: "green", border: "solid 1px green", padding: ".3rem", borderRadius: ".3rem", textAlign: "center", fontWeight: "bold", maxWidth: "350px", margin: "0 auto" }}>Lotes seleccionados correctamente</p>
                            )
                          )
                        }

                        {
                          alertaModal && (
                            <p className={styles.obligatorios}>{alertaModal}</p>
                          )
                        }
                      </>
                    )
                  }

                </div>


                {/*SECCION DE LOTES EN CUADRICULADO DE 3 COL*/}
                {
                  lotes.length > 0 && proyecto.mercado && ejemplo.ejemplo2 ? (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <h4 style={{ paddingTop: "0" }}>Lotes Disponibles: </h4>
                      <div className={`${ejemplo.ejemplo3 ? styles.lotes_div_flex : styles.lotes_div}`}>
                        {lotes.map((lote, index) => (
                          <div
                            key={index}
                            onClick={(e) => handleClick(e, lote)}
                            className={`${styles.lote} ${loteSeleccionado?.clave === lote.clave ? styles.selected : ''}`}
                          >
                            <div className={ejemplo.ejemplo3 ? styles.card_lotes : ""}>
                              <div>
                                <p><span style={{ fontWeight: "bold" }}>{formatearFecha(lote.fecha)}</span></p>
                              </div>
                              <div>
                                <p>Exist.: {lote.existencia}</p>
                              </div>
                              <div className={styles.lote_input}>
                                <label>C.:</label>
                                <input
                                  inputMode='decimal'
                                  onFocus={(e) => e.target.select()}
                                  ref={(el) => inputRefs.current[lote.clave] = el}
                                  type="number"
                                  step="0.01"
                                  max={cantidad}
                                  value={cantidadPorLote[lote.clave] ? (cantidadPorLote[lote.clave] > 0 ? cantidadPorLote[lote.clave].toString().replace(/^0+/, '') : '') : ''}
                                  onChange={(e) => handleCantidadLoteChange(lote.nomalmacen, lote.artdiscretoid, lote.clave, Math.min(e.target.value, lote.existencia))}
                                />
                              </div>
                            </div>

                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className={styles.mensaje_lotes}>
                      <h4>Este articulo no cuenta con lotes</h4>
                    </div>
                  )
                }

                {/*MODAL DE LOTES*/}
                {
                  ejemplo.ejemplo1 && (
                    <div className={`${styles.div_lotes_notas} ${lotes.length > 0 ? styles.div_lotes_notas : styles.col}`}>
                      {
                        ejemplo.ejemplo1 && (
                          lotes.length > 0 && (
                            <div className={styles.div_lotesDisponibles}>
                              <p>Lotes Disponibles: {lotes.length}</p>
                              <p className={styles.boton_modal} onClick={abrirModalLotes}>{"Seleccionar Lotes"}</p>
                            </div>
                          )
                        )
                      }
                    </div>
                  )
                }

              </div>

            ) : (
              <div>
                <div className={styles.container_header}>

                  {/*Boton Agregar opciones*/}
                  <div className={styles.div_agregar_opcion} style={esKit ? { top: "8.5rem" } : {}}>
                    <p className={styles.boton_opciones} onClick={() => setShowOpciones(prev => !prev)} title='Más opciones'><MdMoreVert /></p>
                    {
                      showOpciones && (
                        <div className={styles.div_opciones}>
                          <div>
                            <p onClick={() => {
                              setShowAgregarNotas(true);
                              setShowOpciones(false);
                            }}>Agregar Nota</p>
                          </div>
                          <div>
                            <p onClick={() => setShowModalFoto(true)}>Tomar foto</p>
                          </div>
                        </div>
                      )
                    }
                  </div>

                  <div className={styles.div_imagen}>
                    <img src={articuloCarrito.imagen} alt="" />
                  </div>
                  <div className={styles.div_headerKit}>
                    <div>
                      <label htmlFor="cantidad">Cantidad:</label>
                      <input
                        type="number"
                        inputMode='decimal'
                        onFocus={(e) => e.target.select()}
                        required
                        step="0.01"
                        id="cantidad"
                        min={1}
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                        autoComplete="off"
                      />
                      <p style={{ marginLeft: "1rem" }}>Total: <span style={{ fontWeight: "bold" }}>{formatearCantidad(total)}</span></p>
                    </div>
                    <div>
                      <div>
                        <label htmlFor="precio">Precio:</label>
                        <input
                          type="number"
                          inputMode='decimal'
                          onFocus={(e) => e.target.select()}
                          required
                          step="0.01"
                          id="precio"
                          min={1}
                          value={precioArticulo}
                          onChange={(e) => setPrecioArticulo(e.target.value)}
                          autoComplete="off"
                        />
                      </div>
                      <div>
                        <label htmlFor="descuento">Descuento:</label>
                        <input
                          type="number"
                          inputMode='decimal'
                          onFocus={(e) => e.target.select()}
                          required
                          step="0.01"
                          id="descuento"
                          min={1}
                          value={descuento}
                          onChange={(e) => setDescuento(e.target.value)}
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </div>
                </div>


                <div className={styles.div_componentes}>

                  <div className={styles.componente}>
                    <div className={styles.div_infoKit}>
                      <p>Tomatillo</p>
                      <p style={{ borderBottom: "solid 1px white" }}>{cantidad}</p>
                    </div>
                    <div className={styles.div_lotesKit}>
                      <div className={styles.lote_kit}>
                        <p>Clave: asdas</p>
                        <p>Exist: 10</p>
                        <div>
                          <label htmlFor="">Cant:</label>
                          <input type="number" />
                        </div>
                      </div>
                      <div className={styles.lote_kit}>
                        <p>Clave: asdas</p>
                        <p>Exist: 10</p>
                        <div>
                          <label htmlFor="">Cant:</label>
                          <input type="number" />
                        </div>
                      </div>
                      <div className={styles.lote_kit}>
                        <p>Clave: asdas</p>
                        <p>Exist: 10</p>
                        <div>
                          <label htmlFor="">Cant:</label>
                          <input type="number" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.componente}>
                    <div className={styles.div_infoKit}>
                      <p>Tomatillo</p>
                      <p style={{ borderBottom: "solid 1px white" }}>{cantidad}</p>
                    </div>
                    <div className={styles.div_lotesKit}>
                      <div className={styles.lote_kit}>
                        <p>Clave: asdas</p>
                        <p>Exist: 10</p>
                        <div>
                          <label htmlFor="">Cant:</label>
                          <input type="number" />
                        </div>
                      </div>
                      <div className={styles.lote_kit}>
                        <p>Clave: asdas</p>
                        <p>Exist: 10</p>
                        <div>
                          <label htmlFor="">Cant:</label>
                          <input type="number" />
                        </div>
                      </div>
                      <div className={styles.lote_kit}>
                        <p>Clave: asdas</p>
                        <p>Exist: 10</p>
                        <div>
                          <label htmlFor="">Cant:</label>
                          <input type="number" />
                        </div>
                      </div>
                      <div className={styles.lote_kit}>
                        <p>Clave: asdas</p>
                        <p>Exist: 10</p>
                        <div>
                          <label htmlFor="">Cant:</label>
                          <input type="number" />
                        </div>
                      </div>
                      <div className={styles.lote_kit}>
                        <p>Clave: asdas</p>
                        <p>Exist: 10</p>
                        <div>
                          <label htmlFor="">Cant:</label>
                          <input type="number" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.componente}>
                    <div className={styles.div_infoKit}>
                      <p>Tomatillo</p>
                      <p style={{ borderBottom: "solid 1px white" }}>{cantidad}</p>
                    </div>
                    <div className={styles.div_lotesKit}>
                      <div className={styles.lote_kit}>
                        <p>Clave: asdas</p>
                        <p>Exist: 10</p>
                        <div>
                          <label htmlFor="">Cant:</label>
                          <input type="number" />
                        </div>
                      </div>
                      <div className={styles.lote_kit}>
                        <p>Clave: asdas</p>
                        <p>Exist: 10</p>
                        <div>
                          <label htmlFor="">Cant:</label>
                          <input type="number" />
                        </div>
                      </div>
                      <div className={styles.lote_kit}>
                        <p>Clave: asdas</p>
                        <p>Exist: 10</p>
                        <div>
                          <label htmlFor="">Cant:</label>
                          <input type="number" />
                        </div>
                      </div>
                      <div className={styles.lote_kit}>
                        <p>Clave: asdas</p>
                        <p>Exist: 10</p>
                        <div>
                          <label htmlFor="">Cant:</label>
                          <input type="number" />
                        </div>
                      </div>
                      <div className={styles.lote_kit}>
                        <p>Clave: asdas</p>
                        <p>Exist: 10</p>
                        <div>
                          <label htmlFor="">Cant:</label>
                          <input type="number" />
                        </div>
                      </div>
                      <div className={styles.lote_kit}>
                        <p>Clave: asdas</p>
                        <p>Exist: 10</p>
                        <div>
                          <label htmlFor="">Cant:</label>
                          <input type="number" />
                        </div>
                      </div>
                      <div className={styles.lote_kit}>
                        <p>Clave: asdas</p>
                        <p>Exist: 10</p>
                        <div>
                          <label htmlFor="">Cant:</label>
                          <input type="number" />
                        </div>
                      </div>
                      <div className={styles.lote_kit}>
                        <p>Clave: asdas</p>
                        <p>Exist: 10</p>
                        <div>
                          <label htmlFor="">Cant:</label>
                          <input type="number" />
                        </div>
                      </div>
                      <div className={styles.lote_kit}>
                        <p>Clave: asdas</p>
                        <p>Exist: 10</p>
                        <div>
                          <label htmlFor="">Cant:</label>
                          <input type="number" />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )
          }

          {
            !loading && articuloEditando ? (
              <button type="submit" disabled={lotes.length !== 0 ? !esCantidadValida : false}>Guardar <MdAddShoppingCart /></button>
            ) : !loading && (
              <button type="submit" disabled={lotes.length !== 0 ? !esCantidadValida : false}>Agregar al Carrito <MdAddShoppingCart /></button>
            )
          }

        </form >


        {/* Modal de lotes */}
        {mostrarModalLotes && (
          <>
            <ModalLotes
              cantidad={cantidad}
              lotes={lotes}
              cantidadPorLote={cantidadPorLote}
              handleCantidadLoteChange={handleCantidadLoteChange}
              cerrarModalLotes={cerrarModalLotes}
            />
          </>
        )}
        {/*MODAL AGREGAR NOTA*/}
        {
          showAgregarNotas && (
            <>
              <ModalNotas
                notas={notas}
                setNotas={setNotas}
                setShowAgregarNotas={setShowAgregarNotas}
              />
            </>
          )
        }
        {/*MODAL FOTO*/}
        {
          showModalFoto && (
            <ModalFoto
              setShowModalFoto={setShowModalFoto}
              setShowOpciones={setShowOpciones}
              setImage={setImage}
              image={image}
              articuloEditando={articuloEditando}
              setGuardoFoto={setGuardoFoto}
            />
          )
        }


      </div >
    </>
  );
}
