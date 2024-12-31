import React, { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import styles from '../faceid/faceid.module.css';
import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../../context/CarritoContext';

const Faceid = ({ setUsarFaceid }) => {
  const videoRef = useRef(null);
  const [message, setMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const navigate = useNavigate();
  const { setUsuario } = useCarrito();

  // Cargar modelos de face-api.js
  const loadModels = async () => {
    const MODEL_URL = '/models'; // Asegúrate de que esta ruta sea correcta

    await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

    console.log('Modelos cargados correctamente');
  };

  console.log(localStorage.getItem('users'));
  

  // Detectar rostros y extraer descriptores
  const handleFaceDetection = async () => {
    const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options())
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (detections.length > 0) {
      const detectedDescriptor = detections[0].descriptor;
      console.log('Longitud del descriptor detectado:', detectedDescriptor.length);

      if (detectedDescriptor.length === 128) {
        console.log('Descriptor facial válido');
        // Llamar a la función de verificación o registro aquí si es necesario
      } else {
        console.log('Error: El descriptor no tiene la longitud esperada');
      }
    } else {
      console.log('No se detectaron rostros');
    }
  };

  // Guardar un nuevo usuario en el localStorage
  const saveUserDescriptor = (name, descriptor) => {
    const newUser = {
      name,
      descriptor: Array.from(descriptor)  // Convertimos el descriptor a un array para almacenarlo
    };
    const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
    existingUsers.push(newUser); // Añadir el nuevo usuario a la lista
    localStorage.setItem('users', JSON.stringify(existingUsers)); // Guardar la lista de usuarios
    console.log('Usuario guardado:', name);
    setAllUsers(existingUsers); // Actualizamos la lista localmente
  };
  

  // Recuperar todos los usuarios del localStorage
  const getAllUsers = () => {
    return JSON.parse(localStorage.getItem('users')) || [];
  };

  // Verificar al usuario comparando descriptores
  const verifyUser = async () => {
    const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options())
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (detections.length > 0) {
      const detectedDescriptor = detections[0].descriptor;
      const allUsers = getAllUsers();

      let userFound = false;
      for (const user of allUsers) {
        const storedDescriptor = new Float32Array(user.descriptor);

        if (detectedDescriptor.length === storedDescriptor.length) {
          const distance = faceapi.euclideanDistance(storedDescriptor, detectedDescriptor);
          console.log('Distancia euclidiana:', distance);

          if (distance < 0.6) {  // Ajusta este umbral según sea necesario
            setUserName(user.name);
            setMessage(`Bienvenido, ${user.name}!`);
            userFound = true;
            localStorage.setItem('existeUsuario', 'true');
            localStorage.setItem('usuario', `"${user.name}"`);
            setUsuario(user.name);
            navigate('/');
            // Detener la cámara
            if (videoRef.current && videoRef.current.srcObject) {
              const stream = videoRef.current.srcObject;
              const tracks = stream.getTracks();
              tracks.forEach((track) => {
                track.stop(); // Detener todas las pistas del stream
              });
              console.log('Cámara detenida.');
            }
            break;
          }
        }
      }

      if (!userFound) {
        setMessage("Rostro no reconocido.");
      }
    } else {
      setMessage('No se detectó rostro.');
    }
  };

  // Registrar un nuevo usuario
  const registerUser = async (name) => {
    const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options())
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (detections.length > 0) {
      const faceDescriptor = detections[0].descriptor;
      saveUserDescriptor(name, faceDescriptor);  // Guardamos el descriptor con el nombre
      setUserName(name);
      setMessage(`Usuario registrado como ${name}`);
    } else {
      setMessage('No se detectó rostro para el registro.');
    }
  };

  // Cargar los modelos y configurar el video
  useEffect(() => {
    loadModels();

    // Pedir acceso a la cámara
    navigator.mediaDevices
      .getUserMedia({ video: {} })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        videoRef.current.play();  // Iniciar la reproducción del video
      })
      .catch((err) => console.error('Error al acceder a la cámara: ', err));

    // Cargar usuarios registrados desde el localStorage
    const storedUsers = getAllUsers();
    setAllUsers(storedUsers); // Mostrar la lista de usuarios registrados
  }, []);


  // Detener la cámara
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop()); // Detener todas las pistas del stream
      console.log('Cámara detenida.');
    }
  };

  const handleRegresar = () => {
    setUsarFaceid(false);
    stopCamera();
  }

  return (
    <div className={styles.div_faceid}>
      <h1>Reconocimiento Facial</h1>
      <video ref={videoRef} autoPlay muted onPlay={handleFaceDetection}></video>
      <p>{message}</p>

      {/* Mostrar la lista de usuarios registrados */}
      
      <div>
        <p>Usuarios registrados:</p>
        <ul>
          {allUsers.map((user, index) => (
            <li key={index}>{user.name}</li>
          ))}
        </ul>
      </div>
      

      {/* Si no se ha registrado el usuario, mostrar el campo de nombre y el botón de registro */}
      
      <div>
        <input
          type="text"
          placeholder="Ingresa tu nombre"
          onChange={(e) => setUserName(e.target.value)}
          value={userName}
        />
        <button onClick={() => registerUser(userName)}>Registrar Usuario</button>
      </div>
      



      {/* El botón de verificación siempre está visible */}
      <button onClick={verifyUser}>Verificar Usuario</button>
      <button onClick={handleRegresar}>Regresar</button>
    </div>
  );
};

export default Faceid;