import React, { useState, useEffect, useRef } from 'react';
import styles from "../carrito/carrito.module.css";
import { FaRegTrashAlt, FaEdit, FaCheck } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { BiLike } from "react-icons/bi";
import { jsPDF } from "jspdf";
import { MdMoreVert } from "react-icons/md";
import { useCarrito } from "../../context/CarritoContext"
import { useNavigate } from 'react-router-dom';
import Modal from '../modal/Modal';
import MenuCarrito from './menuCarrito/MenuCarrito';

export default function Carrito() {
  const [showMenu, setShowMenu] = useState(false);
  const [alerta, setAlerta] = useState(false);
  const [nota, setNota] = useState("");
  const [precio, setPrecio] = useState("");
  const [descuento, setDescuento] = useState("");
  const [cantidad, setCantidad] = useState(0);
  const [editarArticulo, setEditarArticulo] = useState(false);
  const [articuloEditando, setArticuloEditando] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [total, setTotal] = useState();
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  const navigate = useNavigate();
  const [lotes, setLotes] = useState([]);
  const [cantidadPorLote, setCantidadPorLote] = useState({});  // Estado para la cantidad seleccionada por lote
  const [lotesArticulosEditados, setLotesArticulosEditados] = useState([]);
  const [lotesDisp, setLotesDisp] = useState([]);
  const [indexEditado, setIndexEditado] = useState("");
  const { proyecto, carrito, setCarrito, cantidadCarrito, cliente, apiURL } = useCarrito();
  const [alertaModal, setAlertaModal] = useState(null);
  const [image, setImage] = useState("");
  const menuRef = useRef();
  const [descargar, setDescargar] = useState(false);
  const [carritoDescarga, setCarritoDescarga] = useState([]);

  useEffect(() => {
    setCarritoDescarga(carrito);
  }, []);

  /*funcion que calcula el precio de
    articulo por su cantidad*/
  useEffect(() => {
    const precioConDescuento = precio - ((precio * descuento) / 100);
    setTotal(precioConDescuento * cantidad);
  }, [cantidad, precio, descuento]);



  useEffect(() => {
    const handleClickOutSide = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutSide);

    return () => {
      document.addEventListener("mousedown", handleClickOutSide);
    }
  }, [showMenu]);



  const fetchLotes = async () => {
    // Asegúrate de que 'articuloEditando' y 'Articulo_id' están definidos
    if (articuloEditando && articuloEditando.articuloid) {

      try {
        // Hacemos la petición y esperamos la respuesta
        const response = await fetch(`${apiURL}/get_lotes_json/${articuloEditando.articuloid}`);

        // Verificamos si la respuesta es válida
        if (!response.ok) {
          throw new Error(`Error en la respuesta de la API: ${response.statusText}`);
        }

        // Parseamos el cuerpo de la respuesta a JSON
        const data = await response.json();

        // Verifica si 'data' es un array antes de continuar

        if (Array.isArray(data)) {
          // Mapeamos los lotes de la API, agregando el campo 'cantidadLote' de 'articuloEditando.lotesArticulos'
          const lotesFiltrados = data.map(lote => {
            // Busca el lote correspondiente en articuloEditando.lotesArticulos
            const loteEdit = articuloEditando.lotesArticulos.find(l => l.artdiscretoid === lote.artdiscretoid);


            if (loteEdit) {
              // Si encontramos el lote correspondiente, le agregamos el campo cantidadLote
              return {
                ...lote,  // Mantén todas las propiedades del lote
                cantidadLote: loteEdit.cantidadLote  // Si no existe, por defecto será 0
              };
            }

            // Si no se encuentra el lote en articuloEditando.lotesArticulos, devolvemos el lote original
            return {
              ...lote,
              cantidadLote: 0
            };
          });

          // Actualiza el estado con los lotes filtrados y con el campo cantidadLote añadido
          setLotes(lotesFiltrados);
        } else {
          console.error("La respuesta no es un array de lotes");
        }
      } catch (error) {
        console.error('Error al obtener los lotes:', error);
      }
    } else {
      console.error('No se ha definido articuloEditando o Articulo_id');
    }
  };

  useEffect(() => {
    // Verifica que articuloEditando y Articulo_id están definidos
    if (articuloEditando && articuloEditando.articuloid) {
      fetchLotes();
    }
  }, [articuloEditando]);


  const restarCantidad = (index) => {
    if (index >= 0 && index < carrito.length && carrito[index].cantGlobal >= 2) {
      const nuevoCarrito = [...carrito];
      nuevoCarrito[index].cantGlobal -= 1;

      // Convertir el carrito a JSON y luego codificarlo en Base64
      const carritoBase64 = btoa(JSON.stringify(nuevoCarrito)); // btoa() codifica a Base64

      // Guardar el carrito codificado en Base64 en localStorage
      sessionStorage.setItem("carrito", carritoBase64);

      // Actualizar el estado con el nuevo carrito
      setCarrito(nuevoCarrito);
    }
  };

  const sumarCantidad = (index) => {
    if (index >= 0 && index < carrito.length) {
      const nuevoCarrito = [...carrito];
      nuevoCarrito[index].cantGlobal += 1;

      // Convertir el carrito a JSON y luego codificarlo en Base64
      const carritoBase64 = btoa(JSON.stringify(nuevoCarrito)); // btoa() codifica a Base64

      // Guardar el carrito codificado en Base64 en localStorage
      sessionStorage.setItem("carrito", carritoBase64);

      // Actualizar el estado con el nuevo carrito
      setCarrito(nuevoCarrito);
    }
  };



  const eliminarArticulo = (index) => {
    // Filtra los artículos que no coincidan con el id que deseas eliminar
    const nuevoCarrito = carrito.filter((item, idx) => idx !== index);

    // Actualiza el estado del carrito
    setCarrito(nuevoCarrito);

    // Codifica el carrito en base64 antes de almacenarlo
    const carritoBase64 = btoa(JSON.stringify(nuevoCarrito));

    // Almacena el carrito codificado en base64 en localStorage
    sessionStorage.setItem("carrito", carritoBase64);
  };

  const confirmarEliminar = () => {
    sessionStorage.removeItem("carrito");
    setCarrito([]);
    setAlerta(false);
    document.body.style.overflow = "";
  };

  const cancelarEliminar = () => {
    setAlerta(false);
    document.body.style.overflow = "";
  };

  const eliminarTodo = () => {
    setAlerta(true);
    document.body.style.overflow = "hidden";
  };

  // Definir la función calcularTotal que actualiza el estado total
  const calcularTotal = () => {
    let total = 0;

    carrito.forEach(item => {
      const cantidadArticulo = item.cantGlobal;
      const precioConDescuento = item.precioArticulo - (item.precioArticulo * item.descuento / 100);
      const totalArticulo = precioConDescuento * cantidadArticulo;
      total += totalArticulo;
    });

    return total.toFixed(2);  // Devolver el total calculado con dos decimales
  };


  // Usar useEffect para ejecutar el cálculo solo cuando el carrito cambia
  useEffect(() => {
    calcularTotal(); // Calcular el total solo cuando el carrito cambie
  }, [carrito]);  // Dependencia de carrito, así que solo se recalcula cuando el carrito cambia


  const previsualización = (e) => {
    const doc = new jsPDF();
    doc.setFontSize(24);
    doc.text("ESPIRAL SISTEMAS", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Cliente: ${cliente.cliente}`, 105, 30, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Consignatario: ${cliente.consignatario && cliente.consignatario}`, 105, 35, { align: "center" });
    doc.setFontSize(18);
    doc.text("Ticket de venta", 105, 45, { align: "center" });
    doc.setFontSize(12);

    const fecha = new Date().toLocaleDateString();
    const ahora = new Date();
    const horas = ahora.getHours();
    const minutos = ahora.getMinutes();
    const segundos = ahora.getSeconds();

    const formatearHora = (h, m, s) => {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    // Información general del ticket
    doc.text(`Observaciones: ${cliente.obs}`, 20, 55);
    doc.text(`Fecha de venta: ${fecha} - ${formatearHora(horas, minutos, segundos)}`, 20, 60);
    doc.setFontSize(12);
    doc.text("Folio: ", 20, 65);

    let yOffset = 80; // Offset para la posición Y de los artículos
    doc.setFontSize(10);

    // Definir anchos de columnas
    const headerX = 5;  // Reducir la posición X inicial para mover todo hacia la izquierda
    const col1Width = 20;  // Imagen
    const col2Width = 60;  // Nombre
    const col3Width = 40;  // Clave Lote
    const col4Width = 25;  // Cantidad Lote
    const col5Width = 20;  // Precio
    const col6Width = 20;  // Total

    // Dibujar encabezado de la tabla con el nuevo orden
    doc.text("Imagen", headerX, yOffset);
    doc.text("Nombre", headerX + col1Width, yOffset);
    doc.text("Clave Lote", headerX + col1Width + col2Width, yOffset);
    doc.text("Cantidad", headerX + col1Width + col2Width + col3Width, yOffset);
    doc.text("Precio", headerX + col1Width + col2Width + col3Width + col4Width, yOffset);
    doc.text("Total", headerX + col1Width + col2Width + col3Width + col4Width + col5Width, yOffset);

    yOffset += 10; // Espacio después de los encabezados

    // Variables para sumar totales
    let totalCompra = 0;
    let totalCantidad = 0; // Para sumar las cantidades de todos los artículos

    let carritoArray = carrito.length > 0 ? carrito : carritoDescarga;

    carritoArray.forEach((item) => {
      const precioArticulo = parseFloat(item.precioArticulo);
      let totalArticulo = 0; // Total por artículo
      let totalCantidadArticulo = 0; // Total de cantidades del artículo

      // Variable para el espacio ocupado por las imágenes
      let imagenYOffset = yOffset;  // Empieza en la misma posición del yOffset
      let imagenHeight = 0;  // Sumar la altura de las imágenes

      // Asegúrate de que las imágenes se dibujan correctamente
      if (item.imagen) {
        doc.addImage(item.imagen, 'JPEG', headerX, imagenYOffset, 15, 15);
        imagenHeight += 17; // 15px para la imagen + 2px de margen
      }

      if (item.foto) {
        doc.addImage(item.foto, 'JPEG', headerX, imagenYOffset + imagenHeight, 15, 15);
        imagenHeight += 17; // 15px para la foto + 2px de margen
      }
      imagenYOffset = imagenYOffset + imagenHeight;

      // Después de renderizar las imágenes, las demás columnas deben usar el yOffset original
      let articuloYOffset = yOffset; // Mantener la misma posición para el nombre y otros datos

      // Columna de "Nombre"
      doc.text(String(item.nombre), headerX + col1Width, articuloYOffset);

      // Verificar si el artículo tiene lotes
      if (item.lotesArticulos && item.lotesArticulos.length > 0) {
        // Iterar sobre los lotes
        item.lotesArticulos.forEach((lote) => {
          const totalLote = precioArticulo * lote.cantidadLote; // Total por lote (precio * cantidad del lote)
          totalArticulo += totalLote; // Sumar al total del artículo
          totalCantidadArticulo += parseFloat(lote.cantidadLote); // Asegurarse de que sea un número

          // Clave del lote
          doc.text(String(lote.clave), headerX + col1Width + col2Width, articuloYOffset);

          // Cantidad del lote (centrado)
          const cantidadLoteX = headerX + col1Width + col2Width + col3Width + col4Width - (col4Width / 2);
          doc.text(String(lote.cantidadLote), cantidadLoteX, articuloYOffset);

          // Precio del artículo
          doc.text(`$${precioArticulo.toFixed(2)}`, headerX + col1Width + col2Width + col3Width + col4Width, articuloYOffset);

          // Total por Lote
          doc.text(`$${totalLote.toFixed(2)}`, headerX + col1Width + col2Width + col3Width + col4Width + col5Width, articuloYOffset);

          articuloYOffset += 10; // Ajuste para los lotes
        });
      } else {
        // Si no hay lotes, se calcula el total solo para el artículo
        totalArticulo = precioArticulo * item.cantGlobal;
        totalCantidadArticulo = parseFloat(item.cantGlobal);

        // Columna de "Total"
        doc.text(String(`$${totalArticulo.toFixed(2)}`), headerX + col1Width + col2Width + col3Width + col4Width + col5Width, articuloYOffset);
      }

      // Mostrar el total de la cantidad y el total de la partida antes de la línea de separación
      const totalCantidadX = headerX + col1Width + col2Width + col3Width + col4Width;
      doc.text(`${totalCantidadArticulo}`, totalCantidadX - (col4Width / 2), articuloYOffset);
      doc.text(`$${totalArticulo.toFixed(2)}`, totalCantidadX + col5Width, articuloYOffset);

      // Ajustar el yOffset para el siguiente artículo
      if (articuloYOffset > imagenYOffset) {
        yOffset = articuloYOffset + 10;
      } else {
        yOffset = imagenYOffset + 10;
      }

      // Verificar si la página se ha llenado y añadir una nueva si es necesario
      if (yOffset > 250) {
        doc.addPage();
        yOffset = 20; // Reiniciar el yOffset para la nueva página
      }

      // Sumar totales
      totalCompra += totalArticulo;
      totalCantidad += totalCantidadArticulo;

      // Dibujar la línea de separación al final de la fila
      doc.line(headerX, yOffset, headerX + col1Width + col2Width + col3Width + col4Width + col5Width + col6Width, yOffset);
      yOffset += 10;
    });

    // Añadir espacio después de la línea

    // Mostrar el total de la compra después de cada artículo
    doc.setFontSize(16);
    doc.text(String(`TOTAL: $${totalCompra.toFixed(2)}`), 20, yOffset + 10);

    // Mostrar el total de cantidades (de los lotes)
    doc.text(String(`CANTIDADES TOTALES: ${totalCantidad}`), 20, yOffset + 20);

    if (!descargar) {
      setPreviewUrl(doc.output('bloburl'));
    } else if (descargar) {
      doc.save(`${cliente.claveCliente || cliente.cliente_id}${fecha}.pdf`);
      cerrarDocumento();
    }

    sessionStorage.removeItem('carrito');
    sessionStorage.removeItem('cliente');
    sessionStorage.removeItem('existeCliente');
    setCarrito([]);
  };


  const handleComprar = (e) => {
    e.preventDefault();

    const detalles = carrito.map(item => ({
      'articuloId': item.articuloid,
      'claveArticulo': item.Clave_articulo,
      'unidades': item.cantGlobal,
      'precioUnitario': item.precioArticulo,
      'dscto': item.descuento,
      'total': (item.precioArticulo * item.cantidad) - (item.precioArticulo * item.descuento / 100 * item.cantidad),
      'descripcion': item.Nombre,
      'notas': item.notas,
      "lotes": item.lotesArticulos.map(lote => ({
        "artdiscretoid": lote.artdiscretoid,
        "cantidad": lote.cantidadLote,
      }))
    }));
    const body = {
      'versionEsquema': 'N/D',
      'tipoComando': 'insac.doctos',
      'tipoDocto': cliente.tipoDocto,
      'encabezado': {
        'clienteId': cliente.cliente_id,
        'claveCliente': cliente.claveCliente,
        'fecha': new Date().toISOString(),
        'observaciones': cliente.obs || '',
        "descuento": "0",
        'subtotal': calcularTotal(),
        'impuesto': '0',
        'total': calcularTotal(),
      },
      'detalles': detalles,
    }
    console.log(JSON.stringify(body, null, 2));
    console.log(body);
  }


  const recuperarCarrito = () => {
    const carritoBase64 = sessionStorage.getItem('carrito');

    if (carritoBase64) {
      try {
        // Decodificamos el carrito de Base64 a JSON
        const carritoDecoded = JSON.parse(atob(carritoBase64));
        setCarrito(carritoDecoded);
      } catch (error) {
        console.error("Error al decodificar carrito desde Base64", error);
      }
    }
  };

  // Recuperar el carrito al montar el componente
  useEffect(() => {
    recuperarCarrito();
  }, []);

  const handleEditarArticulo = (item) => {
    setArticuloEditando(item);
    setNota(item.notas);
    setPrecio(item.precioArticulo);
    setDescuento(item.descuento);
    setCantidad(item.cantGlobal);
    setEditarArticulo(true);
    setLotesDisp(item.lotesArticulos);
  };



  const formatearCantidad = (cantidad) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(cantidad);
  };

  const cerrarDocumento = () => {
    setTimeout(() => {
      window.location.reload(); // Recargar la página
    }, 500);
    setCarrito([]);
    sessionStorage.removeItem("carrito");
    setPreviewUrl("");
    navigate("/");
    sessionStorage.removeItem("cliente");
    sessionStorage.removeItem("existeCliente");
  }

  return (
    <>
      {!previewUrl ? (
        <div className={styles.carrito_contenedor}>
          {
            carrito.length > 0 && (
              <p onClick={() => setShowMenu(true)} className={styles.menu_icon} title='Más opciones'><MdMoreVert /></p>
            )
          }
          <h3>Carrito</h3>
          {carrito.length > 0 && (
            <div className={styles.div_eliminarTodo}>
              <div className={styles.cliente}>
                <p><span>Cliente (No):</span> {cliente.claveCliente && cliente.claveCliente}</p>
                <p><span>Nombre:</span> {cliente.cliente}</p>
                {
                  cliente.consignatario !== '' && (
                    <p><span>Consignatario:</span> {cliente.consignatario}</p>
                  )
                }
                {
                  proyecto.mercado && (
                    <p><span>Tipo Documento:</span> {cliente.tipoDocto.toUpperCase()}</p>
                  )
                }
                {
                  proyecto.klein && (
                    <p><span>Tipo. Pedido:</span> {cliente.pedido.toUpperCase()}</p>
                  )
                }
              </div>
              <p onClick={eliminarTodo} className={styles.eliminarTodo}><FaRegTrashAlt /> Eliminar todo</p>
            </div>
          )}
          <div className={styles.div_articulos}>
            {carrito.length > 0 && (
              <div className={styles.resumen_contenedor}>
                <div className={styles.div_resumen}>
                  <div>
                    <p>Articulos: ({cantidadCarrito})</p>
                    <p>Total Carrito: ${calcularTotal()}</p>
                  </div>
                  <button onClick={(e) => {
                    previsualización();
                    setDescargar(true);
                    handleComprar(e);
                  }}>
                    {
                      proyecto.klein ? (
                        <>
                          Realizar Pedido
                        </>
                      ) : proyecto.mercado && (
                        <>
                          Generar Documento
                        </>
                      )
                    }
                  </button>
                </div>
              </div>
            )}

            {carrito.length > 0 ? carrito.map((item, index) => (
              <div
                key={index}
                className={styles.articulos_contenedor}
              >
                <p className={styles.articulo_nombre}>{item.nombre}</p>
                <div className={styles.articulo_contenedor}>
                  <div className={styles.div_articulo}>
                    <div className={styles.nameImg_container}>
                      <img src={item.imagen} className={styles.articulo_imagen} alt={item.Nombre}></img>
                    </div>
                    <div className={styles.div_cantidad}>
                      <p>Cant. total: <span>{item.cantGlobal}</span></p>

                      {
                        proyecto.mercado && item.lotesArticulos.length > 0 && (
                          <div className={styles.lotes_div_carrito}>
                            <p className={styles.cantidad_lotes}>Cant. por lotes: </p>

                            <div className={styles.container_lotes_carrito}>
                              {item.lotesArticulos.map((lote, index) => (
                                <p className={styles.lotes_carrito} key={index}>
                                  {lote.nomalmacen}: <span>{lote.cantidadLote}</span>
                                </p>
                              ))}
                            </div>

                          </div>
                        )
                      }



                      {
                        proyecto.klein && item.lotesArticulos.length === 0 && (
                          <div className={styles.div_agregar}>
                            <p onClick={() => restarCantidad(index)}>-</p>
                            <p onClick={() => sumarCantidad(index)}>+</p>
                          </div>
                        )
                      }





                    </div>
                    <div className={styles.div_precio}>
                      <p>Precio: ${item.precioArticulo}</p>
                      <p>Subtotal: ${formatearCantidad(item.precioArticulo * item.cantGlobal)}</p>
                      <p>Descuento: {item.descuento}%</p>
                      <p>
                        Total: $
                        {formatearCantidad(((item.precioArticulo - (item.precioArticulo * item.descuento / 100)) * item.cantGlobal).toFixed(2))}
                      </p>


                    </div>
                    <div className={styles.div_editar}>
                      <p onClick={() => eliminarArticulo(index)} className={styles.articulo_eliminar}><FaRegTrashAlt /></p>
                      <p className={styles.editar}
                        onClick={() => {
                          handleEditarArticulo(item);
                          setIndexEditado(index);
                        }}><FaEdit /></p>
                    </div>
                  </div>
                  {
                    item.notas !== "" && (
                      <div className={styles.notas}>
                        <p><span>Notas:</span> {item.notas}</p>
                      </div>
                    )
                  }
                  {
                    item.foto !== null && (
                      <div classname={styles.articulo_contenedor}>
                        <div className={styles.div_articulo}>
                          <div classname={styles.nameImg_container}>
                            <img src={item.foto} className={styles.articulo_imagen} alt="Foto cargada" />
                          </div>
                        </div>
                      </div>
                    )
                  }


                  {/* MODAL EDITAR ARTICULO */}
                  {editarArticulo && articuloEditando.articuloid === item.articuloid && (
                    <>
                      <Modal
                        articuloEditando={articuloEditando}
                        articuloCarrito={articuloEditando}
                        closeModal={() => setEditarArticulo(false)}
                        alertaModal={alertaModal}
                        lotesEditados={lotes}

                      />
                    </>
                  )}
                </div>
                {alerta && <div className={styles.overlay} onClick={cancelarEliminar} />}
                <div className={`alertaEliminar ${alerta ? "mostrar" : ""}`}>
                  <p>Deseas eliminar todo?</p>
                  <div className={styles.div_confirmacion}>
                    <button onClick={confirmarEliminar}><BiLike /></button>
                    <button onClick={cancelarEliminar}><IoMdClose /></button>
                  </div>
                </div>
              </div>
            )) : (
              <div className={styles.div_carritoVacio}>
                <h4>Agrega articulos al carrito, y los veras aqui.</h4>
                <p><IoCartOutline /></p>
              </div>
            )}

          </div>
        </div>
      ) : (
        <div className={styles.pdf_container}>
          <h3>Previsualización del Ticket</h3>
          <div>
            <button onClick={(e) => {
              previsualización(e);
            }}>
              Descargar PDF</button>
            <button onClick={cerrarDocumento}><IoMdClose /></button>
          </div>
          <iframe src={previewUrl} width="100%" height="500px" title="Previsualización PDF"></iframe>
        </div>
      )}

      <div ref={menuRef} className={`${styles.menu_carrito} ${showMenu ? styles.mostrarMenu : ""}`}>
        {
          showMenu && (
            <MenuCarrito
              showMenu={showMenu}
              setShowMenu={setShowMenu}
              setImage={setImage}
              image={image}
            />
          )
        }
      </div>
    </>
  );
}

