import React, { useRef, useState } from 'react';
import styles from '../modalLotes/modalLotes.module.css';

export default function ModalLotes({
    cantidad,
    lotes,
    cantidadPorLote,
    handleCantidadLoteChange,
    cerrarModalLotes
}) {
    const inputRef = useRef({});
    const [loteSeleccionado, setLoteSeleccionado] = useState(null);

    const handleLoteClick = (lote) => {
        setLoteSeleccionado(lote);
        if (inputRef.current[lote.clave]) {
            inputRef.current[lote.clave].focus();
        }
    };

    const formatearFecha = (fecha) => {
        const fechaObj = new Date(fecha);
        return fechaObj.toLocaleDateString('es-ES');
    };
    
    return (
        <>
            <div className='overlay'></div>
            <div className={styles.modal_lotes}>
                <div className={styles.modal_lotes_content}>
                    <h4>Cantidad a seleccionar de los lotes: {cantidad}</h4>
                    <div className={styles.lotes_div}>
                        {lotes.map((lote, index) => (
                            <div
                                key={index}
                                onClick={() => handleLoteClick(lote)}
                                className={`${styles.lote} ${loteSeleccionado?.clave === lote.clave ? styles.selected : ''}`}
                            >
                                <div className={styles.lote_row}>
                                    <div className={styles.lote_radio}>
                                        <label htmlFor={lote.nombre}>{lote.clave}</label>
                                    </div>
                                    <div className={styles.disponibles}>
                                        <p><span>{lote.existencia}</span></p>
                                    </div>
                                </div>

                                <div className={styles.lote_row}>
                                    <p>Fecha: <span>{formatearFecha(lote.fecha)}</span></p>
                                </div>
                                <div className={styles.lote_input}>
                                    <label>Cantidad para este lote:</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        max={lote.existencia}
                                        value={cantidadPorLote[lote.clave] || 0}
                                        onChange={(e) => handleCantidadLoteChange(lote.nomalmacen, lote.artdiscretoid, lote.clave, Math.min(e.target.value, lote.existencia))}
                                        ref={(el) => inputRef.current[lote.clave] = el}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={cerrarModalLotes}>Confirmar o cerrar</button>
                </div>
            </div>
        </>
    );
}
