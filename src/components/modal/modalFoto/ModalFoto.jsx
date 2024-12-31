import React, { useState, useRef, useEffect } from 'react';
import styles from '../modalFoto/modalFoto.module.css';
import { useCarrito } from '../../../context/CarritoContext';
import { FaRegTrashAlt } from "react-icons/fa";

export default function ModalFoto({ setShowModalFoto, setShowOpciones, setImage, image, articuloEditando, setGuardoFoto }) {
    const [hasCameraPermission, setHasCameraPermission] = useState(false);
    const [tomarFoto, setTomarFoto] = useState(false);
    const { carrito, setCarrito } = useCarrito();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null); // Para manejar el stream de la cámara
    const [hasCameraStarted, setHasCameraStarted] = useState(false); // Estado para verificar si la cámara ya fue iniciada

    useEffect(() => {
        if (articuloEditando) {
            if (articuloEditando.foto) {
                setImage(articuloEditando.foto);
            }
        }
    }, [articuloEditando, setImage]);

    // Solicitar acceso a la cámara cuando el modal se muestra
    useEffect(() => {
        if (tomarFoto) {
            const getCamera = async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    streamRef.current = stream;
                    setHasCameraPermission(true);

                    // Asignar el stream al videoRef
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

            // Limpiar el stream cuando el modal se cierre
            return () => {
                if (streamRef.current) {
                    const tracks = streamRef.current.getTracks();
                    tracks.forEach(track => track.stop()); // Detener el stream de la cámara
                }
            };
        }
    }, [tomarFoto]);

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
    const handleActivarCamara = () => {
        setTomarFoto(true); // Activamos la cámara
        setImage(null); // Limpiamos la imagen si hay alguna
    };

    // Función para cerrar el modal
    const closeModal = () => {
        setShowModalFoto(false);
        setTomarFoto(false); // Apagamos la cámara al cerrar el modal
        if (streamRef.current) {
            const tracks = streamRef.current.getTracks();
            tracks.forEach(track => track.stop()); // Detenemos el stream de la cámara
        }
        setShowOpciones(false);
    };

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

    // Función para eliminar la foto del carrito y el estado
    const eliminoFotofn = () => {
        setImage(null); // Limpiamos la imagen
        setGuardoFoto(false);
        const editado = carrito.map((articulo) =>
            articuloEditando.articuloid === articulo.articuloid
                ? {
                    ...articulo,
                    foto: image
                }
                : articulo
        );
        articuloEditando.foto = null
        // Codificamos el carrito a Base64 antes de almacenarlo
        const carritoBase64 = btoa(JSON.stringify(editado));

        // Guardamos el carrito codificado en Base64 en localStorage
        sessionStorage.setItem("carrito", carritoBase64);

        // Establecer el carrito actualizado en el estado
        setCarrito(editado);
    };

    // Función para guardar la foto
    const handleGuardarFoto = () => {
        if (articuloEditando) {
            articuloEditando.foto = null;
        }
        setShowModalFoto(false);
        setShowOpciones(false);
        setGuardoFoto(true);
        alert('Se guardó la foto');
    };

    return (
        <>
            <div className='overlay'></div>
            <div className='modal' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <h3>Agrega una Fotografía</h3>


                {/* Mostrar la cámara si tomarFoto es verdadero y no hay imagen */}
                {tomarFoto && !image && (
                    <div className={styles.cameraContainer}>
                        {hasCameraPermission ? (
                            <>
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
                        </div>

                        <button className={styles.tomarDenuevo} onClick={() => {
                            handleActivarCamara(); // Reactivar la cámara
                        }}>
                            Tomar de nuevo
                        </button>

                        <button className={styles.eliminarBtn} onClick={eliminoFotofn}>
                            <FaRegTrashAlt />
                        </button>
                    </div>
                )}

                {
                    !image && !tomarFoto && (
                        <p className={styles.mensaje}>No tienes foto guardada aún</p>
                    )
                }

                <div className={styles.div_botones}>
                    <button onClick={closeModal}>
                        Cerrar
                    </button>
                    {
                        image ? (
                            <button onClick={handleGuardarFoto}>Guardar</button>
                        ) : !tomarFoto && !image && (
                            <button onClick={handleActivarCamara}>Activar cámara</button>
                        )
                    }

                </div>
            </div >
        </>
    );
}
