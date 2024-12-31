import React from 'react'
import styles from "../modalNotas/modalNotas.module.css"

export default function ModalNotas({ notas, setNotas, setShowAgregarNotas }) {
    return (
        <>
            <div className='overlay'></div>
            <div className={"modal"}>
                <h3 style={{ padding: ".5rem" }} className={styles.titulo}>Agrega una nota</h3>
                <div className={styles.div_notas}>
                    <div className={styles.div_nota}>
                        <label htmlFor="notas">Notas:</label>
                        <textarea
                            id="notas"
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                            placeholder='Escribe una nota aquí'
                        />
                    </div>
                    <div className={styles.div_notas_guardadas}>
                        <h5>Notas guardadas</h5>
                        <div className={styles.notas_guardadas}>
                            <p onClick={(e) => setNotas(e.target.textContent)}>Facturar</p>
                            <p onClick={(e) => setNotas(e.target.textContent)}>Imprimir pdf</p>
                            <p onClick={(e) => setNotas(e.target.textContent)}>Enviar por correo</p>
                        </div>
                    </div>
                    <div className={styles.div_botones}>
                        <button onClick={()=>setShowAgregarNotas(false)}>
                            Cerrar
                        </button>
                        <button onClick={() => setShowAgregarNotas(false)}>
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
