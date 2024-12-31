import React, { useState } from 'react';
import styles from "../tipoDocto/tipoDocto.module.css";
import { useNavigate } from 'react-router-dom';
import { BiLogOut } from "react-icons/bi";
import { useCarrito } from '../../context/CarritoContext';

export default function TipoDocto() {
    const { cliente, setCliente } = useCarrito();
    const [tipo, setTipo] = useState("");  // Estado para el tipo de documento
    const navigate = useNavigate();

    // Manejar el cambio en el select
    const handleChange = (event) => {
        setTipo(event.target.value);
    }

    // Manejar el submit del formulario
    const handleSubmit = (event) => {
        event.preventDefault(); // Prevenir que el formulario recargue la página

        // Crear un nuevo cliente con el tipo de documento
        const nvoCliente = {
            ...cliente,  // Copiar los datos actuales del cliente
            tipoDocto: tipo  // Actualizar el tipo de documento
        }

        // Establecer el cliente actualizado en el contexto
        setCliente(nvoCliente);

        // Guardar el cliente actualizado en sessionStorage
        sessionStorage.setItem("cliente", JSON.stringify(nvoCliente));

        // Redirigir al carrito
        navigate("/carrito");
    }

    return (
        <>
            <div className='overlay'></div>
            <form onSubmit={handleSubmit} className='modal'>
                <h3>Tipo de Documento</h3>
                <div className={styles.div_usuario}>
                    <p>Regresar</p>
                    <p onClick={() => navigate("/carrito")}><BiLogOut /></p>
                </div>
                <div className={styles.campos}>
                    <label htmlFor="select">Tipo de documento: </label>
                    <select
                        id="select"
                        value={tipo}  // El valor actual del select está ligado al estado 'tipo'
                        onChange={handleChange}  // Cambiar el estado 'tipo' cuando el usuario selecciona una opción
                    >
                        <option value="" disabled>Selecciona uno</option>
                        <option value="OV">Orden de Venta</option>
                        <option value="TV">Ticket de Venta</option>
                        <option value="RE">Remisión</option>
                        <option value="PE">Pedido</option>
                    </select>
                </div>
                <button type="submit" className={`boton-modal ${styles.btn}`}>Guardar</button>
            </form>
        </>
    )
}

