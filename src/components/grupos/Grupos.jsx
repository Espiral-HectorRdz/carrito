import styles from './grupos.module.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import img from "../../../public/tv.jpg";
import { BiLogOut } from "react-icons/bi";
import { useCarrito } from "../../context/CarritoContext";
import useGrupoLinea from "../../customHook/useGrupoLinea";
import SHA256 from "crypto-js/sha256";
import { FaSpinner } from "react-icons/fa6";
import elote from "../../../public/elote.jpg";
import cebolla from "../../../public/cebolla.webp";
import chile from "../../../public/chile.jpg";
import limon from "../../../public/limon.png";
import tomate from "../../../public/tomate.jpg";
import pepino from "../../../public/pepino.jpg";



export default function Grupos() {
  const { setGrupoId } = useGrupoLinea();
  const { proyecto, cliente, setCliente, setCarrito, apiURL } = useCarrito();
  const [grupos, setGrupos] = useState([]);
  const [lineas, setLineas] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    setLoading(true);
    const fetchGrupos = async () => {
      try {
        const resGrupos = await fetch(`${apiURL}/get_catalogos_json/grupos_lineas`);
        const dataGrupos = await resGrupos.json();
        if (resGrupos.ok) {
          setGrupos(dataGrupos);
        } else {
          console.log("error al obtener los grupos");
        }
      } catch (error) {
        console.log("Hubo un problema con la solicitud de grupos", error);
      } finally {
        setLoading(false);
      }
    }

    const fetchLineas = async () => {
      try {
        const resLineas = await fetch(`${apiURL}/get_catalogos_json/lineas_articulos`);
        const dataLineas = await resLineas.json();
        if (resLineas.ok) {
          setLineas(dataLineas);
        } else {
          console.log("Error al obtener las lineas");
        }
      } catch (error) {
        console.log("Hubo un error en la solicitud de lineas", error);
      }
    }

    fetchGrupos();
    fetchLineas();
  }, []);

  const handleGroupClick = (grupoId) => {
    setGrupoId(grupoId);

    // Codificar grupoId a Base64 antes de almacenarlo
    const encodedGrupoId = btoa(JSON.stringify(grupoId));

    // Almacenar el grupoId codificado en localStorage
    localStorage.setItem("grupoId", encodedGrupoId);

    // Navegar a la ruta /lineas
    navigate(`/lineas`);
  };



  const handleCambiarCliente = () => {
    navigate("/");
  } 

  const cargarImagen = (grupo) => {
    if (proyecto.klein) {
      return `../../../public/lineas/${grupo.Grupo_linea_id}.jpg`
    }

    if (proyecto.mercado) {
      if (grupo.Nombre === "CEBOLLA ") {
        return cebolla;
      } else if (grupo.Nombre === "CHILE") {
        return chile;
      } else if (grupo.Nombre === "TOMATE") {
        return tomate;
      } else if (grupo.Nombre === "LIMON") {
        return limon;
      } else if (grupo.Nombre === "PEPINO ") {
        return pepino;
      } else if (grupo.Nombre === "ELOTE") {
        return elote;
      } else {
        return img;
      }
    }

  }

  return (
    <div className={styles.container}>
      <div className={styles.div_cliente}>
        <div>
          <p>Cliente: <span>{cliente.cliente.toUpperCase()}</span></p>
          {
            cliente.consignatario !== '' && (
              <p>Consignatario: <span>{cliente.consignatario.toUpperCase()}</span></p>
            )
          }
        </div>
        <div onClick={handleCambiarCliente} className={styles.cambiar_cliente}>
          {/*<p>Cambiar cliente</p>*/}
          <p title='Nuevo cliente'><BiLogOut /></p>
        </div>
      </div>
      <h3 className={styles.titulo_grupos}>Grupos</h3>

      {
        loading ? (
          <div className={styles.div_cargando}>
            <p className={styles.cargando}><FaSpinner /></p>
            <p>Cargando Grupos...</p>
          </div>
        ) : (
          <div className="items_contenedor">
            {grupos.filter(grupo =>
              lineas.some(linea => linea.Grupo_Linea_Id === grupo.Grupo_linea_id)
            ).map((grupo, index) => {
              // Filtrar las líneas relacionadas para el grupo actual
              const relatedLineas = lineas.filter(linea => linea.Grupo_Linea_Id === grupo.Grupo_linea_id);

              return (
                <div key={index}>
                  <div
                    onClick={() => handleGroupClick(grupo.Grupo_linea_id)}
                    className="item_contenedor"
                  >

                    <div className="div_nombre_item">
                      <p>{grupo.Nombre}</p>
                    </div>
                    <div className='div_imagen_item'>
                      <img src={cargarImagen(grupo)} alt="" />
                    </div>

                  </div>
                </div>
              );


            })}
          </div>
        )
      }

    </div>
  );
}







