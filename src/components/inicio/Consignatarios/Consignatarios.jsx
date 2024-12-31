import React, { useState } from 'react';
import styles from "../Consignatarios/consignatarios.module.css";

const Consignatarios = ({ setShowConsignatario, setConsignatarioInput }) => {
    const [DIR_CLI_ID, setDirCliId] = useState(-1);
    const [NOMBRE_CONSIG, setNombre] = useState('');
    const [TELEFONO1, setTelefono] = useState('');
    const [EMAIL, setEmail] = useState('');
    const [RFC_CURP, setRFC] = useState('');
    const [alerta, setAlerta] = useState('');

    const handleInputChange = (e, setter) => {
        setter(e.target.value.toUpperCase());
    };

    const handleTelefonoChange = (e) => {
        // Solo permitimos números enteros en TELEFONO1 y un máximo de 10 dígitos
       const value = e.target.value;
       if (/^\d*$/.test(value) && value.length <= 10) {  // Acepta solo números (y vacío), con máximo 10 caracteres
       setTelefono(value);
   }
   };

   const handleRFCChange = (e) => {
       // Obtener el valor y convertirlo a mayúsculas
       let value = e.target.value.toUpperCase();  
       // Solo permitimos números y letras en RFC, con un máximo de 13 caracteres
       if (/^[A-Za-z0-9]*$/.test(value) && value.length <= 13) {
           setRFC(value);  // Guardamos el valor formateado
       }
   };

    const handleRegistrar = async (e) => {
        e.preventDefault();
        if(NOMBRE_CONSIG === ''){
            setAlerta('Debes ingresar un nombre');
            return;
        }else if(TELEFONO1 === ''){
            setAlerta('Debes ingresar un telefono');
            return;
        }
        // Agrupar los datos bajo la llave "insert"
        const consignatarioData = {
            insert: {
                DIR_CLI_ID,
                NOMBRE_CONSIG,
                TELEFONO1,
                EMAIL,
                RFC_CURP
            }
        };
        console.log(consignatarioData)
        setConsignatarioInput(NOMBRE_CONSIG);
        setShowConsignatario(false);
        // Realizar la solicitud POST a la API
        try {
            const response = await fetch('http://api/consignatarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(consignatarioData),
            });

            if (!response.ok) {
                throw new Error('Error al registrar consignatario');
            }

            // Si la respuesta es exitosa, se procesa la respuesta
            const data = await response.json();
            console.log('Registro exitoso:', data);

            // Actualizar el estado en el componente padre
            setConsignatarioInput(NOMBRE_CONSIG);
            setShowConsignatario(false);

        } catch (error) {
            setAlerta('Hubo un error al registrar el consignatario. Intenta de nuevo.');
            console.error('Error:', error);
        }
    };

    return (
        <div className="overlay">
            <div className="modal">
                <h3>Registrar Consignatario</h3>
                <form className={styles.div_form}>
                    <div>
                        <label htmlFor='name'>Nombre</label>
                        <input
                            id='name'
                            style={{width:"100%"}}
                            value={NOMBRE_CONSIG}
                            onChange={(e) => {
                                handleInputChange(e, setNombre)
                                setAlerta('');
                            }}
                            placeholder="Nombre..."
                            autoComplete='off'
                        />
                    </div>
                    <div>
                        <label htmlFor='tel'>Telefono</label>
                        <input
                            id='tel'
                            value={TELEFONO1}
                            onChange={(e)=>{
                                handleTelefonoChange(e);
                                setAlerta('');
                            }}  
                            placeholder="Telefono..."
                            autoComplete='off'
                        />
                    </div>
                    <div>
                        <label htmlFor='email'>Email</label>
                        <input
                            id='email'
                            value={EMAIL}
                            onChange={(e) => handleInputChange(e, setEmail)}
                            placeholder="Email..."
                        />
                    </div>
                    <div>
                        <label htmlFor='rfc'>RFC</label>
                        <input
                            id='rfc'
                            value={RFC_CURP}
                            onChange={handleRFCChange}  // Usamos la función para manejar el RFC
                            placeholder="RFC..."
                            autoComplete='off'
                        />
                    </div>

                    {
                        alerta !== '' && (
                            <p className={styles.alert}>{alerta}</p>
                        )
                    }

                    <div className={styles.div_botones}>
                        <p onClick={() => setShowConsignatario(false)} className={styles.btnRegistrar}>
                            Atras
                        </p>
                        <button
                            onClick={handleRegistrar} // Registrar y descargar JSON
                        >
                            Registrar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Consignatarios;
