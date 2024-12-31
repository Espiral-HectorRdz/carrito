// Inactividad.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Inactividad = ({ cerrarSesion }) => {
  const navigate = useNavigate(); // Usamos navigate para redirigir

  let tiempoInactivo;
  const tiempoLimite = 500000;

  // Función que se ejecuta cuando detectamos inactividad
  const redirigirALogin = () => {
    cerrarSesion(); // Llamamos a cerrarSesion para actualizar el estado
    navigate('/login'); // Después de cerrar sesión, redirigimos a Login
  };

  // Resetear el temporizador de inactividad
  const resetearTiempoInactividad = () => {
    clearTimeout(tiempoInactivo);
    tiempoInactivo = setTimeout(redirigirALogin, tiempoLimite); // Llama a redirigirALogin después de inactividad
  };

  useEffect(() => {
    // Agregar eventos de interacción para resetear el temporizador
    document.onmousemove = resetearTiempoInactividad;
    document.onkeypress = resetearTiempoInactividad;
    document.onclick = resetearTiempoInactividad;

    // Iniciar el temporizador de inactividad
    resetearTiempoInactividad();

    // Limpiar los eventos cuando el componente se desmonta
    return () => {
      document.onmousemove = null;
      document.onkeypress = null;
      document.onclick = null;
    };
  }, []); // Este efecto solo se ejecuta cuando el componente se monta

  return null; // Este componente no necesita renderizar nada, solo gestionar la inactividad
};

export default Inactividad;