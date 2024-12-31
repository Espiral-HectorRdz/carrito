import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from "../lineas/lineas.module.css"
import { useNavigate } from 'react-router-dom';
import img from "../../../public/tv.jpg"
import { useCarrito } from "../../context/CarritoContext"
import useGrupoLinea from '../../customHook/useGrupoLinea';
import { FaSpinner } from "react-icons/fa6";
import elote from "../../../public/elote.jpg";
import cebolla from "../../../public/cebolla.webp";
import chile from "../../../public/chile.jpg";
import limon from "../../../public/limon.png";
import tomate from "../../../public/tomate.jpg";
import pepino from "../../../public/pepino.jpg";



export default function Lineas() {
  const { grupoId, setLineaId } = useGrupoLinea();
  const [lineas, setLineas] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { proyecto, apiURL } = useCarrito();

  useEffect(() => {
    setLoading(true);
    const fetchLineas = async () => {
      try {
        const res = await fetch(`${apiURL}/get_catalogos_json/lineas_articulos`);
        const data = await res.json();
        if (res.ok) {
          const filteredLineas = data.filter(linea => String(linea.Grupo_Linea_Id) === String(grupoId));
          setLineas(filteredLineas);
        } else {
          console.log("Hubo un error al obtener lineas");
        }
      } catch (error) {
        console.log("Hubo un problema con la solicitud lineas");
      } finally {
        setLoading(false);
      }
    }
    fetchLineas();

  }, [grupoId]);

  const handleLinea = (lineaId) => {
    setLineaId(lineaId);

    // Codificar el lineaId a Base64 antes de almacenarlo
    const encodedLineaId = btoa(JSON.stringify(lineaId));

    // Almacenar en localStorage con el valor codificado
    localStorage.setItem("lineaId", encodedLineaId);

    // Navegar a la ruta deseada
    navigate(`/articulos`);
  };

  
  const cargarImagen = (linea) => {
    if(proyecto.klein){
      return `../../../public/lineas/${linea.Grupo_Linea_Id}.jpg`;
    }

    if(proyecto.mercado){
      if(linea.Grupo_Linea_Id === 614){
        return cebolla;
      }else if(linea.Grupo_Linea_Id === 615){
        return chile;
      }else if(linea.Grupo_Linea_Id === 616){
        return tomate;
      }else if(linea.Grupo_Linea_Id === 617){
        return limon;
      }else if(linea.Grupo_Linea_Id === 618){
        return pepino;
      }else if(linea.Grupo_Linea_Id === 619){
        return elote;
      }else{
        return img;
      }
    }
  }


  return (
    <div className={styles.container}>
      <h3>Líneas del grupo: { }</h3>
      {
        loading ? (
          <div className={styles.div_cargando}>
            <p className={styles.cargando}><FaSpinner /></p>
            <p>Cargando Lineas...</p>
          </div>
        ) : (
          <>
            <div className={`${lineas.length <= 1 ? "column" : "items_contenedor"}`}>
              {
                lineas.map((linea, index) => (
                  <div key={index} onClick={() => handleLinea(linea.Linea_Articulo_Id)} className="item_contenedor">
                    <div className='div_nombre_item'>
                      <p>{linea.Nombre}</p>
                    </div>
                    <div className='div_imagen_item'>
                      <img src={cargarImagen(linea)} alt="" />
                    </div>
                  </div>
                ))
              }
            </div>
          </>
        )
      }
    </div>
  );
}
