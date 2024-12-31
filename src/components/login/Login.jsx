import React, { useState, useEffect } from 'react'
import styles from "../login/login.module.css"
import { FaUser } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import { FaSpinner } from "react-icons/fa6";
import { FaEye } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { useCarrito } from "../../context/CarritoContext"
import CryptoJS from "crypto-js";
import { TbFaceId } from "react-icons/tb";
import Faceid from '../faceid/Faceid';



export default function Login() {
  const { usuario, setUsuario, proyecto } = useCarrito();
  const navigate = useNavigate();
  const [loginInputs, setLoginInputs] = useState({ user: "", password: "" });
  const [alerta, setAlerta] = useState({ visible: false, mensaje: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usarFaceid, setUsarFaceid] = useState(false);

  const users = [
    { user: "hector", password: "He123" },
    { user: "espiral", password: 123 }
  ];


  /*CONVERTIR INPUTS A MD5*/
  const convMD5 = (inputs) => {
    const userMD5 = CryptoJS.MD5(inputs.user).toString(CryptoJS.enc.Hex);
    const passwordMD5 = CryptoJS.MD5(inputs.password).toString(CryptoJS.enc.Hex);
    const objMD5 = {
      userMD5,
      passwordMD5
    }
    console.log(objMD5);

    // Enviar el objeto a la API usando fetch
    fetch('https://api.com/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(objMD5),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Respuesta API:', data);
      })
      .catch(error => {
        console.error('Error al enviar los datos a la API:', error);
      });
  }

  /*CONVERTIR INPUTS A SHA256*/
  const convSHA256 = (inputs) => {
    const userSHA = CryptoJS.SHA256(inputs.user).toString(CryptoJS.enc.Hex);
    const passwordSHA = CryptoJS.SHA256(inputs.password).toString(CryptoJS.enc.Hex);
    const objSHA = {
      userSHA,
      passwordSHA
    }
    console.log(objSHA);
  }


  const handleLogin = (e) => {
    e.preventDefault();
    const existeUser = users.find(user => user.user.toString() === loginInputs.user.toLowerCase().toString().trim())
    const existePass = users.find(user => user.password.toString() === loginInputs.password.trim().toString())
    if (loginInputs.user.trim() === "" || loginInputs.password.trim() === "") {
      setAlerta({ visible: true, mensaje: "Por favor, llena todos los campos" });
      setTimeout(() => {
        setAlerta({ visible: false, mensaje: "" })
      }, 3000);
      return;
    }
    if (!existeUser) {
      setAlerta({ visible: true, mensaje: "Usuario no encontrado" })
      setTimeout(() => {
        setAlerta({ visible: false, mensaje: "" })
      }, 3000);
      return;
    }
    if (!existePass) {
      setAlerta({ visible: true, mensaje: "Contraseña incorrecta" })
      setTimeout(() => {
        setAlerta({ password: false })
      }, 3000);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setUsuario(loginInputs.user);
      localStorage.setItem("existeUsuario", "true");
      if(proyecto.klein){
        navigate("/funcion");
      } else if (proyecto.mercado){
        navigate("/");
      }
      convMD5(loginInputs);
      convSHA256(loginInputs);
    }, 1000);
  }

  

  return (
    <div className={styles.login_container}>

      <div className='overlay'></div>
      <form onSubmit={handleLogin} className={"modal"} action="">

        <h3>Inicia Sesión</h3>
        {
          loading ? (
            <p className={styles.spinner}><FaSpinner /></p>
          ) : !usarFaceid ? (
            <div className={styles.div_form}>

              <div className={`${styles.div_alerta} ${alerta.visible ? styles.mostrar_alerta : ""}`}>
                {
                  alerta.visible && (
                    <p className={styles.alerta_error}>{alerta.mensaje}</p>
                  )
                }
              </div>

              <h4>Inicia sesión con tus credenciales</h4>
              <div className={styles.div_user}>
                <label className={styles.label_user} htmlFor="user"><FaUser /></label>
                <input
                  value={loginInputs.user}
                  onChange={(e) => setLoginInputs(prevInput => ({
                    ...prevInput,
                    user: e.target.value
                  }))}
                  className={styles.input_user}
                  id='user'
                  type="text"
                  placeholder='Escribe tu usuario'
                  autoComplete="off"
                />
              </div>
              <div className={styles.div_password}>
                <label className={styles.label_password} htmlFor="password"><RiLockPasswordFill /></label>
                <input
                  value={loginInputs.password}
                  onChange={(e) => setLoginInputs(prevInput => ({
                    ...prevInput,
                    password: e.target.value.trim()
                  }))}
                  className={styles.input_password}
                  id='password'
                  type={showPassword ? "text" : "password"}
                  placeholder='Escribe tu contraseña'
                />
                {
                  loginInputs.password && (
                    <p onClick={() => setShowPassword(prev => !prev)} className={styles.eye}><FaEye /></p>
                  )
                }
              </div>
              <h4>o entra con tu rostro</h4>
              <div className={styles.div_faceId}>
                <label onClick={() => setUsarFaceid(true)}><TbFaceId/> <span>FaceID</span></label>
              </div>


              <button>Iniciar Sesión</button>
            </div>
          ) : (
            <Faceid setUsarFaceid={setUsarFaceid}/>
          )
        }
      </form>

    

    </div>
  )
}
