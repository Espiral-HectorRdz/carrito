import React from 'react'
import styles from "../funcion/funcion.module.css"
import { BiLogOut } from "react-icons/bi";
import { useCarrito } from '../../context/CarritoContext';
import { useNavigate } from 'react-router-dom';

export default function Funcion() {

    
    const navigate = useNavigate();
    const { usuario, setUsuario, setCarrito, funcion, setFuncion } = useCarrito();

    const handleCerrarSesion = () => {
        setUsuario(null);
        localStorage.removeItem("existeUsuario");
        navigate("/login");
    };

    //pasa a componente de pedido y almacena en la variable global Funcion
    //dependiendo lo que se seleccione para asi condicionar en la app
    //segun su funcion
    const handleFuncion = (funcion) => {
        setFuncion(funcion);
        navigate("/");
    }

    return (
        <>
            <div className='overlay'></div>
            <form className='modal'>
                <h3>Función</h3>
                <div className={styles.div_usuario}>
                    <p>Usuario: <span>{usuario}</span></p>
                    <p onClick={handleCerrarSesion}><BiLogOut /></p>
                </div>
                <div className={styles.funciones}>
                    <p onClick={()=>handleFuncion("mesero")}>Mesero</p>
                    <p onClick={()=>handleFuncion("autoServicio")}>Auto servicio</p>
                </div>
            </form>
        </>
    )
}
