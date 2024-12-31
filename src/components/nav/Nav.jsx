import React, { useContext, useEffect, useRef, useState } from 'react';
import styles from "../nav/nav.module.css";
import { RiMenu2Line } from "react-icons/ri";
import { IoCartOutline } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { IoIosSearch } from "react-icons/io";
import { BiLogOut } from "react-icons/bi";
import { useLocation, useNavigate } from 'react-router-dom';
import Grupos from '../grupos/Grupos';
import { useCarrito } from '../../context/CarritoContext';

export default function Nav({ activeComponent, setActiveComponent }) {
    const navigate = useNavigate();
    const [lastRoute, setLastRoute] = useState("/");
    const location = useLocation();
    const [showCategorias, setShowCategorias] = useState(false);
    const [busquedaParam, setBusquedaParam] = useState("");
    const menuRef = useRef(null);
    const buscarRef = useRef(null); // Aquí tienes el ref para el contenedor de búsqueda
    const inputBuscarRef = useRef(null); // Nuevo ref para el input de búsqueda
    const [isCarritoActive, setIsCarritoActive] = useState(false);

    const { proyecto, cantidadCarrito, usuario, setCliente, setCarrito } = useCarrito();

    const abrirMenu = () => setActiveComponent("menu");
    const cerrarMenu = () => setActiveComponent(null);

    useEffect(() => {
        if (location.pathname !== '/carrito') {
            setIsCarritoActive(false);
        }
    }, [location, isCarritoActive]);

    useEffect(() => {
        if (location.pathname !== "/carrito" && location.pathname !== "/menu") {
            setActiveComponent(null);
        }
    }, [location.pathname, setActiveComponent]);

    useEffect(() => {
        // Si el componente "buscar" se activa, poner el foco en el input
        if (activeComponent === "buscar" && inputBuscarRef.current) {
            inputBuscarRef.current.focus();
        }
    }, [activeComponent]); // Solo ejecutará cuando activeComponent cambie

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target) && activeComponent === "menu") {
                cerrarMenu();
            }
            if (buscarRef.current && !buscarRef.current.contains(event.target) && activeComponent === "buscar") {
                setActiveComponent(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeComponent]);

    const toggleCarrito = () => {
        if (isCarritoActive) {
            setIsCarritoActive(false);
            if (lastRoute && lastRoute !== "/carrito") {
                navigate(lastRoute);
            } else {
                navigate("/");
            }
        } else {
            setLastRoute(location.pathname);
            setIsCarritoActive(true);
            navigate("/carrito");
        }
    };

    const toggleMenu = () => {
        if (activeComponent === "menu") {
            setActiveComponent(null);
        } else {
            setLastRoute(location.pathname);
            setActiveComponent("menu");
        }
    };

    const handleInicio = () => {
        navigate("/grupos");
        setActiveComponent(null);
    };

    const toggleBuscar = () => {
        if (activeComponent === "buscar") {
            setActiveComponent(null);
        } else {
            setActiveComponent("buscar");
        }
    };

    const handleBusqueda = (e) => {
        e.preventDefault();
        navigate(`/busqueda/${busquedaParam}`);
        setActiveComponent(null);
        setBusquedaParam("");
    };


    const handleCerrarSesion = () => {
        localStorage.removeItem("funcion");
        localStorage.removeItem("existeUsuario");
        sessionStorage.removeItem("existeCliente");
        sessionStorage.removeItem("cliente");
        setCarrito([]);
        sessionStorage.removeItem("carrito");
        navigate("/login");
        window.location.reload();
    };

    const handleVenta = () => {
        setActiveComponent(null);
        navigate("/");
    };

    const handleOrdenVenta = () => {
        navigate("/ordenCompra");
        cerrarMenu();
    };

    const cambiarColor = (color) => {
        let colorGris, colorBlanco, textColor;

        if (color === "grises") {
            colorGris = "#e4e4e4";
            colorBlanco = "#ffffff";
            textColor = "#000000";
        } else if (color === "rojo") {
            colorGris = "#ad0b0b";
            colorBlanco = "#d14e4e";
            textColor = "#ffffff";
        } else if (color === "azul") {
            colorGris = "#0087c5";
            colorBlanco = "#8dc7e2";
            textColor = "#ffffff";
        } else if (color === "verde") {
            colorGris = "#148868";
            colorBlanco = "#79cf84";
            textColor = "#ffffff";
        }

        // Aplicar las variables CSS
        document.documentElement.style.setProperty("--color-gris", colorGris);
        document.documentElement.style.setProperty("--color-blanco", colorBlanco);
        document.documentElement.style.setProperty("--text-color", textColor);

        // Guardar las propiedades en localStorage
        localStorage.setItem("colorGris", colorGris);
        localStorage.setItem("colorBlanco", colorBlanco);
        localStorage.setItem("textColor", textColor);
    }
    window.onload = () => {
        // Verificar si las propiedades están guardadas en el localStorage
        const colorGris = localStorage.getItem("colorGris");
        const colorBlanco = localStorage.getItem("colorBlanco");
        const textColor = localStorage.getItem("textColor");

        // Si están disponibles, aplicar los estilos
        if (colorGris && colorBlanco && textColor) {
            document.documentElement.style.setProperty("--color-gris", colorGris || "#ad0b0b");
            document.documentElement.style.setProperty("--color-blanco", colorBlanco || "#d14e4e");
            document.documentElement.style.setProperty("--text-color", textColor || "#ffffff");
        }
    }
    useEffect(() => {
        if(proyecto.klein){
            document.documentElement.style.setProperty("--color-gris", "#ad0b0b");
            document.documentElement.style.setProperty("--color-blanco", "#d14e4e");
            document.documentElement.style.setProperty("--text-color", "#ffffff");
            return;
        }
        if(proyecto.mercado){
            document.documentElement.style.setProperty("--color-gris", "#148868");
            document.documentElement.style.setProperty("--color-blanco", "#79cf84");
            document.documentElement.style.setProperty("--text-color", "#ffffff");
        }
        
    }, []);



    return (
        <div className={styles.container}>
            <nav className={styles.nav}>
                <div className={styles.div_menu}>
                    <p title='Ver Menu' onClick={toggleMenu} className={`${styles.menu} ${activeComponent === "menu" && styles.active}`}>
                        <RiMenu2Line />
                    </p>
                    {
                        proyecto.klein ? (
                            <img src={"../../../public/articulos/logo.png"} onClick={handleInicio} />
                        ) : proyecto.mercado && (
                            <h2 onClick={handleInicio}>EspiralS</h2>
                        )
                    }

                </div>

                {showCategorias && <Grupos />}
                <div className={styles.iconos_contenedor}>
                    <p title={activeComponent === "buscar" ? "Cerrar Busqueda" : "Buscar Articulo"} onClick={toggleBuscar} className={`${styles.buscar} ${activeComponent === "buscar" && styles.active}`}>
                        {
                            activeComponent === "buscar" ? (
                                <IoMdClose />
                            ) : (
                                <IoIosSearch />
                            )
                        }
                    </p>
                    <p title={isCarritoActive ? "Cerrar Carrito" : "Ver carrito"} onClick={toggleCarrito} className={`${styles.carrito} ${isCarritoActive && styles.active}`}>
                        <IoCartOutline />
                        {<span>{cantidadCarrito}</span>}
                    </p>
                </div>
            </nav>

            <div ref={menuRef} className={`${styles.menu_dom} ${activeComponent === "menu" ? styles.mostrar_menu : ""}`}>
                {
                    activeComponent === "menu" && (
                        <>
                            <div className={styles.overlay}></div>
                            <div className={styles.menu_container} >
                                <p onClick={cerrarMenu} className={styles.close_menu}><IoMdClose /></p>
                                <div className={styles.div_usuario}>
                                    <p className={styles.usuario}>Usuario: <span>{usuario.split(" ")[0]}</span></p>
                                    <p title='Cerrar sesion' onClick={handleCerrarSesion} className={styles.salir}><BiLogOut /></p>
                                </div>

                                <div className={styles.div_opciones}>
                                    <div className={styles.opciones}>
                                        <div onClick={() => navigate("/grupos")}>
                                            <p>Ver Grupos</p>
                                        </div>
                                        <div onClick={handleVenta}>
                                            <p>Cambiar Cliente</p>
                                        </div>
                                        <div onClick={handleOrdenVenta}>
                                            <p>Orden de Compra</p>
                                        </div>
                                    </div>
                                    <div className={styles.div_personalizacion}>
                                        <h5>Personalización</h5>
                                        <div className={styles.colores}>
                                            <div onClick={() => cambiarColor("grises")} className={styles.grises}></div>
                                            <div onClick={() => cambiarColor("rojo")} className={styles.rojo}></div>
                                            <div onClick={() => cambiarColor("azul")} className={styles.azul}></div>
                                            <div onClick={() => cambiarColor("verde")} className={styles.verde}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )
                }
            </div>

            <div ref={buscarRef} className={`div_buscar ${activeComponent === "buscar" ? "mostrar" : ""}`}>
                {
                    activeComponent === "buscar" && (
                        <form onSubmit={handleBusqueda} className={`${styles.buscar_contenedor} ${activeComponent === "buscar" ? styles.activeInput : ''}`}>
                            <div className={styles.modal_busqueda}>
                                <div className={styles.div_busca}>
                                    <input
                                        id='buscar'
                                        ref={inputBuscarRef} // Aquí aplicamos el ref
                                        value={busquedaParam}
                                        onChange={(e) => setBusquedaParam(e.target.value)}
                                        type="text"
                                        autoComplete='off'
                                    />
                                    <button disabled={busquedaParam.trim() === ""}>Buscar</button>
                                </div>
                            </div>
                        </form>
                    )
                }
            </div>
        </div>
    );
}
