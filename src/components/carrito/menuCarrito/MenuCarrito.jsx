import React, { useState, useRef, useEffect } from 'react';
import styles from "../menuCarrito/menuCarrito.module.css";
import { IoMdClose } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { MdLabelOff } from 'react-icons/md';
import { useCarrito } from '../../../context/CarritoContext';
import { BiLogIn } from 'react-icons/bi';

export default function MenuCarrito({ showMenu, setShowMenu, setImage, image }) {
    const navigate = useNavigate();

    const [hasCameraPermission, setHasCameraPermission] = useState(false);
    const [tomarFoto, setTomarFoto] = useState(false);
    const [showTipoDocumento, setShowTipoDocumento] = useState(false);
    const videoRef = useRef(null);
    const { cliente, setCliente } = useCarrito();
    const canvasRef = useRef(null);
    const streamRef = useRef(null); // Para manejar el stream de la cámara
    const [tipo, setTipo] = useState("");
    const [mostrarImagen, setMostrarImagen] = useState(false);
    const [hasCameraStarted, setHasCameraStarted] = useState(false); // Estado para verificar si la cámara ya fue iniciada

    // Opciones de tipo de documento
    const opcionesTipoDoc = [
        { value: 'OV', label: 'Orden de Venta' },
        { value: 'TV', label: 'Ticket de Venta' },
        { value: 'RE', label: 'Remisión' },
        { value: 'PE', label: 'Pedido' }
    ];

    // Solicitar acceso a la cámara cuando el menú se muestra
    useEffect(() => {
        if (tomarFoto) {
            const getCamera = async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    streamRef.current = stream;
                    setHasCameraPermission(true);

                    // Solo asignar el stream al videoRef si ya existe el video
                    if (videoRef.current && videoRef.current.srcObject !== stream) {
                        videoRef.current.srcObject = stream;
                    }

                    // Llamamos a refreshVideo solo una vez, cuando la cámara comienza a funcionar
                    if (!hasCameraStarted) {
                        setHasCameraStarted(true);
                        refreshVideo(); // Llamamos a refreshVideo solo una vez
                    }

                } catch (error) {
                    console.error('Error al acceder a la cámara:', error);
                    setHasCameraPermission(false);
                }
            };

            getCamera();

            // Limpiar el stream cuando el menú se cierre o el componente se desmonte
            return () => {
                if (streamRef.current) {
                    const tracks = streamRef.current.getTracks();
                    tracks.forEach(track => track.stop()); // Detener el stream de la cámara
                }
            };
        }
    }, [tomarFoto, hasCameraStarted]); // Aseguramos que solo se ejecute una vez

    // Función para refrescar la cámara
    const refreshVideo = () => {
        if (streamRef.current) {
            const tracks = streamRef.current.getTracks();
            tracks.forEach(track => track.stop()); // Detenemos el flujo actual
        }

        // Volver a iniciar la cámara
        setTomarFoto(false); // Apagar la cámara temporalmente
        setTimeout(() => {
            setTomarFoto(true); // Reactivar la cámara después de unos segundos
        }, 1000);
    };

    // Función para capturar la imagen
    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
            const img = canvasRef.current.toDataURL('image/png');
            setImage(img); // Guardamos la imagen en el estado
            setTomarFoto(false); // Deja de mostrar el video y muestra la imagen
        } else {
            console.error('No se pudo acceder al video o al canvas');
        }
    };

    // Función para activar la cámara y mostrar la opción de tomar foto
    const handleTomarfoto = () => {
        setTomarFoto(true); // Activamos la cámara
        setImage(null); // Limpiamos la imagen si hay alguna
    };

    // Función para cerrar el menú
    const closeMenu = () => {
        setShowMenu(false);
        setTomarFoto(false); // Apagamos la cámara al cerrar el menú
        if (streamRef.current) {
            const tracks = streamRef.current.getTracks();
            tracks.forEach(track => track.stop()); // Detenemos el stream de la cámara
        }
    };

    // Función para tomar de nuevo la foto
    const handleTomarDeNuevo = () => {
        setTomarFoto(true); // Re-activar la cámara para tomar otra foto
        setImage(null); // Limpiar la imagen anterior
    };

    // Función para eliminar la foto
    const handleEliminarFoto = () => {
        setImage(null); // Limpiamos la imagen guardada
    };

    // Función para guardar la foto (puedes personalizar esto según tu lógica)
    const handleGuardar = () => {
        alert("Foto guardada correctamente.");
        setMostrarImagen(true);
    };

    // Manejar el cambio en el select
    const handleChange = (value) => {
        setTipo(value); // Cambiar el tipo de documento

        // Crear un nuevo cliente con el tipo de documento
        const nvoCliente = {
            ...cliente,  // Copiar los datos actuales del cliente
            tipoDocto: value  // Actualizar el tipo de documento
        };

        // Establecer el cliente actualizado en el contexto
        setCliente(nvoCliente);

        // Guardar el cliente actualizado en sessionStorage
        sessionStorage.setItem("cliente", JSON.stringify(nvoCliente));

        setShowTipoDocumento(false);
        setShowMenu(false);
    };

    const cambiarCliente = () => {
        navigate('/');
    }

    return (
        <>
            <div>
                <p onClick={closeMenu} className={styles.close_icon}><IoMdClose /></p>
                <div className={styles.menu_container}>
                    <div className={styles.opciones}>
                        <p onClick={cambiarCliente}>Cambiar Cliente</p>
                        <p onClick={() => setShowTipoDocumento(prev => !prev)}>Cambiar tipo de documento</p>
                        {
                            showTipoDocumento && (
                                <div className={styles.tipoDocumento}>
                                    <label htmlFor="docto">Tipo de documento: </label>
                                    <div className={styles.opciones}>
                                        {opcionesTipoDoc.map((opcion) => (
                                            <p
                                                key={opcion.value}
                                                onClick={(e) => handleChange(opcion.value)}
                                            >
                                                {opcion.label}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )
                        }

                        <p onClick={handleTomarfoto}>Tomar una foto</p>
                        <p>Tomar video</p>
                    </div>
                </div>
            </div>

            {/* Mostrar la cámara si el estado tomarFoto es verdadero */}
            {showMenu && tomarFoto && !image && (
                <div className={styles.cameraContainer}>
                    {hasCameraPermission ? (
                        <>
                            {/* Mostrar video en tiempo real */}
                            <video ref={videoRef} width="320" height="240" autoPlay></video>
                            <button onClick={captureImage}>Tomar Foto</button>
                            <canvas ref={canvasRef} width="320" height="240" style={{ display: 'none' }}></canvas>
                        </>
                    ) : (
                        <p>No se puede acceder a la cámara. Verifica los permisos.</p>
                    )}
                </div>
            )}

            {/* Mostrar la foto capturada en lugar del video */}
            {image && (
                <div className={styles.cameraContainer}>
                    <h4>Foto Actual: </h4>
                    <div style={{ padding: "1rem" }}>
                        <img src={image} alt="Captura" width="320" height="240" />
                        <div>
                            <button onClick={handleEliminarFoto}>Eliminar Foto</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}