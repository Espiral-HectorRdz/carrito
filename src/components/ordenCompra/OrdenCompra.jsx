import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import styles from "../ordenCompra/ordenCompra.module.css"
import { BiLogOut } from "react-icons/bi";

export default function OrdenCompra() {
    const navigate = useNavigate();
    const [fechaInput, setFechaInput] = useState('');
    const [cliente, setCliente] = useState('');
    const [direccion, setDireccion] = useState('');
    const [email, setEmail] = useState('');
    const [orden, setOrden] = useState('');

    // Establecer la fecha actual al cargar el componente
    useEffect(() => {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0]; // Formato de fecha "YYYY-MM-DD"
        setFechaInput(formattedDate);
    }, []);

    const handleSalir = () => {
        navigate("/grupos");
    }

    const handleOrdenCompra = (e) => {
        e.preventDefault();
        // Aquí podrías agregar la lógica para guardar la orden de compra.
        console.log("Orden de compra guardada");
    }

    return (
        <>
            <div className='overlay'></div>
            <div className={styles.orden_container}>
                <form onSubmit={handleOrdenCompra} className={styles.orden_form}>
                    <h3>Orden de Compra</h3>

                    <div className={styles.div_form}>
                        <p onClick={handleSalir} className={styles.salir}>Salir<span><BiLogOut /></span></p>
                        <div className={styles.div_campos}>
                            <label htmlFor="orden">Orden de Compra No: </label>
                            <input
                                id='orden'
                                autoComplete="off"
                                value={orden}
                                onChange={(e) => setOrden(e.target.value)}
                            />
                        </div>
                        <div className={styles.div_campos}>
                            <label htmlFor='fecha'>Fecha:</label>
                            <input
                                id='fecha'
                                type="date"
                                value={fechaInput}
                                onChange={(e) => setFechaInput(e.target.value)} // Permitir la edición de la fecha
                            />
                        </div>

                        <h5>Datos del Cliente</h5>
                        <div className={styles.div_campos}>
                            <label htmlFor='cliente'>Cliente:</label>
                            <input
                                autoComplete="off"
                                id='cliente'
                                value={cliente}
                                onChange={(e) => setCliente(e.target.value)} // Control de cambio
                                type="text"
                            />
                        </div>
                        <div className={styles.div_campos}>
                            <label htmlFor='direccion'>Dirección:</label>
                            <input
                                autoComplete="off"
                                id='direccion'
                                value={direccion}
                                onChange={(e) => setDireccion(e.target.value)} // Control de cambio
                                type="text"
                            />
                        </div>
                        <div className={styles.div_campos}>
                            <label htmlFor='email'>Email:</label>
                            <input
                                autoComplete="off"
                                id='email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)} // Control de cambio
                                type="email"
                            />
                        </div>

                        <button type="submit">Guardar</button>
                    </div>
                </form>
            </div>
        </>
    );
}

