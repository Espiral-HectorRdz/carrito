import React, { useState, useEffect, useRef } from 'react';
import styles from "../articulos/articulos.module.css";
/*hooks de react router*/
import { useParams } from 'react-router-dom';
/*iconos de react icons*/
import { BiLike } from "react-icons/bi";
import { FaSpinner } from "react-icons/fa6";
import { MdGridView } from "react-icons/md";
import { MdOutlineViewAgenda } from "react-icons/md";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
/*imagen de prueba*/
import img from "../../../public/tv.jpg";
/*componente de Modal*/
import Modal from "../modal/Modal";
/*contexto de carrito*/
import { useCarrito } from '../../context/CarritoContext';
import useGrupoLinea from "../../customHook/useGrupoLinea"
import botanas from "../../../public/articulos/botana.jpg"
import hamburguesa from "../../../public/articulos/hamburguesa.jpg"
import bebidas from "../../../public/articulos/soda.jpg"
import complementos from "../../../public/articulos/porcionQueso.png"
import ensaladas from "../../../public/articulos/ensalada pollo2.jpg"
import extras from "../../../public/articulos/gajos.png"

//IMAGENES PARA PROYECTO MERCADO
import elote from "../../../public/elote.jpg";
import cebolla from "../../../public/cebolla.webp";
import chile from "../../../public/chile.jpg";
import limon from "../../../public/limon.png";
import tomate from "../../../public/tomate.jpg";
import pepino from "../../../public/pepino.jpg";


/*Componente Articulos*/
export default function Articulos() {
  const { searchTerm } = useParams();
  const { lineaId } = useGrupoLinea();
  const { proyecto, alerta, handleAgregar, view, setView, apiURL, setCarrito } = useCarrito(); // extraccion de variables o funciones reciclables del contecto carrito
  //const { lineaId } = useParams(); // extraccion del parametro pasado de la ruta anterior que contiene el id de la linea
  const [loading, setLoading] = useState(true); // variable local de loading
  const [articulos, setArticulos] = useState([]); // variable donde se almacenaran los articulos ya filtrados que coinciden con el id de lineas
  const [articuloCarrito, setArticuloCarrito] = useState({}); //variable para pasarle el objeto del articulo seleccionado al modal y de ahi mostrar sus datos
  const [modal, setModal] = useState(false); // variable mara activar o desactivar el modal
  const [ordenarPor, setOrdenarPor] = useState(false); //variable para activar o desactivar las opciones de ordenar articulos
  const ordenarRef = useRef(null);

  const [mostrarPrecio, setMostrarPrecio] = useState(()=>{
    if(proyecto.klein){
      return true;
    }
    if(proyecto.mercado){
      return false;
    }
  });



  useEffect(() => {
    setLoading(true);

    const fetchArticulos = async () => {
      try {
        const res = await fetch(`${apiURL}/get_catalogos_json/articulos`);
        const data = await res.json();

        if (res.ok) {
          // Si existe searchTerm, filtrar por él
          if (searchTerm) {
            const resultados = data.filter(articulo =>
              articulo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setArticulos(resultados);
          } else {
            // Si no hay searchTerm, filtrar solo por lineaId
            const filteredArticulos = data.filter(
              articulo => String(articulo.lineaarticuloid) === String(lineaId)
            );
            setArticulos(filteredArticulos);
          }
        }
      } catch (error) {
        console.log("Hubo un problema al obtener los artículos", error);
      } finally {
        setLoading(false);
      }
    }

    fetchArticulos();
  }, [lineaId, searchTerm, apiURL]); // Dependencias actualizadas para incluir searchTerm


  // Manejar clics fuera del menú
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ordenarRef.current && !ordenarRef.current.contains(event.target)) {
        setOrdenarPor(null);
      }
    };

    // Escuchar clics en el documento
    document.addEventListener('mousedown', handleClickOutside);

    // Limpiar el evento al desmontar el componente
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ordenarRef]);


  /*funcion para activar el modal
    del articulo*/
  const handleModal = (articulo) => {
    setModal(true);
    setArticuloCarrito({
      ...articulo,
      imagen: cargarImagen(articulo),
      descripcion: cargarDesc(articulo)
    });
  };

  

  /*Esta funcion agrega un articulo
    desde la vista general, sin necesidad
    de adentrarse al articulo*/
  /*const handleAgregarArticulos = (articulo) => {
    const itemToAdd = ({ ...articulo, cantidad, notas, precioArticulo, descuento });
    handleAgregar(itemToAdd);
  }
    */

  const closeModal = () => {
    setModal(false);
  };

  useEffect(() => {
    if (modal) {
      document.body.style.overflow = 'hidden'; // Bloquea el scroll
    } else {
      document.body.style.overflow = 'unset'; // Restaura el scroll
    }
  }, [modal]);


  const handleOrdenar = (orden) => {
    // Crear una copia de articulos para no modificar el array original
    const copiaArticulos = [...articulos];
    let ordenados;

    // Ordenar por precio (menor a mayor)
    if (orden === "menor") {
      ordenados = copiaArticulos.sort((a, b) => a.preciolista - b.preciolista);
      console.log("ordenados menor a mayor");
      setOrdenarPor(false);

      // Ordenar por precio (mayor a menor)
    } else if (orden === "mayor") {
      ordenados = copiaArticulos.sort((a, b) => b.preciolista - a.preciolista);
      console.log("ordenados mayor a menor");
      setOrdenarPor(false);

      // Ordenar por nombre de A a Z
    } else if (orden === "az") {
      ordenados = copiaArticulos.sort((a, b) => a.nombre.localeCompare(b.nombre));
      console.log("ordenados de A a Z");
      setOrdenarPor(false);

      // Ordenar por nombre de Z a A
    } else if (orden === "za") {
      ordenados = copiaArticulos.sort((a, b) => b.nombre.localeCompare(a.nombre));
      console.log("ordenados de Z a A");
      setOrdenarPor(false);
    }

    // Actualiza el estado de articulos con el array ordenado
    setArticulos(ordenados);
  };


  const cargarImagen = (articulo) => {
    if(proyecto.klein){
      const imagenURL = `../../../public/articulosid/${articulo.articuloid}.jpg`;
      if(imagenURL !== undefined){
        return img;
      } else if (articulo.lineaarticuloid === 53476) {
        return botanas;
      } else if (articulo.lineaarticuloid === 53482) {
        return hamburguesa;
      } else if (articulo.lineaarticuloid === 53494) {
        return bebidas;
      } else if (articulo.lineaarticuloid === 53488) {
        return complementos;
      } else if (articulo.lineaarticuloid === 53484) {
        return ensaladas;
      } else if (articulo.lineaarticuloid === 53490) {
        return extras;
      }
      return;
    }

    if(proyecto.mercado){
      if (articulo.lineaarticuloid === 623 || articulo.lineaarticuloid === 1300) {
        return cebolla;
      } else if (articulo.lineaarticuloid === 627 || articulo.lineaarticuloid === 628 || articulo.lineaarticuloid === 629 || articulo.lineaarticuloid === 687 || articulo.lineaarticuloid === 5262 || articulo.nombre.includes("CHILE") || articulo.nombre.includes("chile")) {
        return chile;
      } else if (articulo.lineaarticuloid === 624 || articulo.lineaarticuloid === 625 || articulo.lineaarticuloid === 9306 || articulo.nombre.includes("TOMATE")) {
        return tomate;
      } else if (articulo.lineaarticuloid === 626 || articulo.nombre.includes("LIMON")) {
        return limon;
      } else if (articulo.lineaarticuloid === 630 || articulo.nombre.includes("PEPINO")) {
        return pepino;
      } else if (articulo.lineaarticuloid === 631 || articulo.nombre.includes("ELOTE")) {
        return elote;
      }
      else {
        return img;
      }
    }
    
  }

  const cargarDesc = (articulo) => {
    if (articulo.lineaarticuloid === 623 || articulo.lineaarticuloid === 1300) {
      return "Disfruta de la frescura y sabor único de nuestra cebolla, ideal para dar un toque delicioso y crujiente a tus platillos. Perfecta para ensaladas, guisos y mucho más. ¡Agrégala a tu cocina y mejora cada receta!";
    } else if (articulo.lineaarticuloid === 627 || articulo.lineaarticuloid === 628 || articulo.lineaarticuloid === 629 || articulo.lineaarticuloid === 687 || articulo.lineaarticuloid === 5262) {
      return "Añade un toque de picante y sabor a tus comidas con nuestro chile fresco. Perfecto para darle vida a salsas, tacos y guisos. ¡Haz que cada bocado sea una explosión de sabor!";
    } else if (articulo.lineaarticuloid === 624 || articulo.lineaarticuloid === 625 || articulo.lineaarticuloid === 9306) {
      return "Refresca tus platillos con el sabor jugoso y natural de nuestro tomate. Ideal para ensaladas, salsas y guisos. ¡Un ingrediente esencial para resaltar el sabor de tus recetas!";
    } else if (articulo.lineaarticuloid === 626) {
      return "Agrega frescura y un toque ácido con nuestro limón fresco. Perfecto para aderezos, bebidas y dar ese sabor vibrante a tus platillos. ¡El toque ideal para cualquier receta!";
    } else if (articulo.lineaarticuloid === 630) {
      return "Disfruta de la frescura y crocancia de nuestro pepino. Ideal para ensaladas, bocadillos y jugos. ¡Un ingrediente refrescante que aporta sabor y nutrición a tus comidas!";
    } else if (articulo.lineaarticuloid === 631) {
      return "Disfruta del sabor dulce y tierno de nuestro elote fresco. Perfecto para asar, hervir o agregar a tus platillos favoritos. ¡Una delicia que realza cualquier comida!";
    } else {
      return "Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias ut recusandae aperiam eos quas perferendis cum accusantium nihil quibusdam saepe animi accusamus reiciendis quod, culpa consequatur modi quos deserunt maiores!"
    }
  }


  const formatearCantidad = (cantidad) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(cantidad);
  };


  return (
    <>
      <div className={styles.container}>

        {loading ? (

          <div className={styles.div_cargando}>
            <p className={styles.cargando}><FaSpinner /></p>
            <p>Cargando artículos...</p>
          </div>

        ) : (

          <>
            <h3>{searchTerm ? `Resultados de búsqueda para: ${searchTerm}` : "Artículos"}</h3>
            <div className={`${"alerta"} ${alerta ? "mostrar" : ""}`}>
              Agregado <span><BiLike /></span>
            </div>

            <div className={view.grid ? "productos_contenedor" : "productos_contenedor_row"}>
              <div className={styles.views_contenedor}>
                <div className={`${styles.views}`}>
                  <div className={view.grid ? styles.active : ""} onClick={() => {
                    setView({ grid: true, row: false })
                  }}
                  >
                    <MdGridView />
                  </div>
                  <div className={view.row ? styles.active : ""} onClick={() => {
                    setView({ grid: false, row: true })
                  }}>
                    <MdOutlineViewAgenda />
                  </div>
                </div>
                <div className={styles.ordenar}>
                  <div onClick={() => setOrdenarPor(prev => !prev)} className={styles.div_ordenar}>
                    <p>Ordenar por</p>
                    <p className={styles.arrow}><MdOutlineKeyboardArrowDown/></p>
                  </div>
                  <div ref={ordenarRef} className={`ordenar_container ${ordenarPor ? "mostrar_ordenar" : ""}`}>
                    {
                      ordenarPor && (
                        <div>
                          <p onClick={() => handleOrdenar("menor")}>Precio (menor a mayor)</p>
                          <p onClick={() => handleOrdenar("mayor")}>Precio (mayor a menor)</p>
                          <p onClick={() => handleOrdenar("az")}>Nombre (A a Z)</p>
                          <p onClick={() => handleOrdenar("za")}>Nombre (Z a A)</p>
                        </div>
                      )
                    }
                  </div>
                </div>

              </div>
              {
                articulos.length > 0 ? (
                  articulos.map((articulo, index) => (
                    <div onClick={() => handleModal(articulo)} className={view.grid ? "producto_contenedor" : "producto_contenedor_row"} key={index}>
                      <p className={view.row ? "producto_nombre_row" : "producto_nombre"}>{articulo.nombre}</p>
                      <div className={view.row ? "div_flex" : ""}>
                        <div className={view.row ? "" : ""}>
                          <img className={view.grid ? "producto_imagen" : "producto_imagen_row"} src={cargarImagen(articulo)} />
                        </div>
                        <div className={styles.div_info}>
                          {
                            mostrarPrecio && (
                              <>
                                <p className={`producto_precio`}>{`Precio: $${formatearCantidad(articulo.preciolista)}`}</p>
                                <p className={`producto_descuento`}>{`Descuento: ${descuento} %`}</p>
                              </>
                            )
                          }
                          <button className='producto_boton' onClick={(e) => {
                            //e.stopPropagation();
                            //handleAgregarArticulos(articulo);
                          }}>
                            {/*Agregar <span><MdAddShoppingCart /></span>*/}
                            Ver mas
                          </button>
                        </div>
                      </div>

                      {
                        view.row && (
                          <div className="div_descripcion">
                            <p>{cargarDesc(articulo)}</p>
                          </div>
                        )
                      }

                    </div>
                  ))
                ) : (
                  <p className={styles.no_disponibles}>{searchTerm ? `No hay resultados para la busqueda: ${searchTerm}` : "No hay artículos disponibles para esta línea."}</p>
                )
              }
            </div>
          </>

        )}

      </div>


      {modal && (
        <>
          <Modal
            articuloCarrito={articuloCarrito}
            closeModal={closeModal}
            setModal={setModal}
          />
        </>
      )}

    </>
  );
}



