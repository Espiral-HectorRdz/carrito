import React, {useState} from 'react'
import styles from "../todos/todos.module.css"
import { MdAddShoppingCart } from "react-icons/md";
import { BiLike } from "react-icons/bi";
import tvImage from "../../../public/tv.jpg";
import { useCarrito } from '../../context/CarritoContext'

export default function Todos() {
  const { handleAgregar, alerta } = useCarrito();
  

  const Productos = [
    {
        Articulo_id: 1,
        Clave_articulo: 1201203210120,
        Nombre: "SmartTV",
        imagen: tvImage,
        precioArticulo: 10,
        descuento: 10,
    },
    {
      Articulo_id: 2,
      Clave_articulo: 1201203210120,
      Nombre: "IPhone 15",
      imagen: tvImage,
      precioArticulo: 10,
      descuento: 0,
    },
    {
      Articulo_id:3,
      Clave_articulo: 1201203210120,
      Nombre: "Ipad",
      imagen: tvImage,
      precioArticulo: 10,
      descuento: 0,
    },
    {
      Articulo_id:4,
      Clave_articulo: 1201203210120,
      Nombre: "Mouse Logi",
      imagen: tvImage,
      precioArticulo: 10,
      descuento: 0,
    },
    {
      Articulo_id:5,
      Clave_articulo: 1201203210120,
      Nombre: "Monitor 24",
      imagen: tvImage,
      precioArticulo: 10,
      descuento: 0,
    },
    {
      Articulo_id:6,
      Clave_articulo: 1201203210120,
      Nombre: "Pc Gamer",
      imagen: tvImage,
      precioArticulo: 10,
      descuento: 0,
    },
    {
      Articulo_id:7,
      Clave_articulo: 1201203210120,
      Nombre: "MacBook M2",
      imagen: tvImage,
      precioArticulo: 10,
      descuento: 0,
    },
    {
      Articulo_id:8,
      Clave_articulo: 1201203210120,
      Nombre: "Airpods",
      imagen: tvImage,
      precioArticulo: 10,
      descuento: 0,
    },
    {
      Articulo_id:9,
      Clave_articulo: 1201203210120,
      Nombre: "Procesador intel",
      imagen: tvImage,
      precioArticulo: 10,
      descuento: 0,
    },
    {
      Articulo_id: 10,
      Clave_articulo: 1201203210120,
      Nombre: "Laptop hp",
      imagen: tvImage,
      precioArticulo: 10,
      descuento: 0,
    },
    {
      Articulo_id: 11,
      Clave_articulo: 1201203210120,
      Nombre: "Watch",
      imagen: tvImage,
      precioArticulo: 10,
      descuento: 0,
    },
    {
      Articulo_id:12,
      Clave_articulo: 1201203210120,
      Nombre: "Iphone 13",
      imagen: tvImage,
      precioArticulo: 10,
      descuento: 0,
    },
  ]

  



  return (
    <div className={styles.todos_contenedor}>
      <div className={`${"alerta"} ${alerta && "mostrar"}`}>
          Agregado <span><BiLike /></span>
      </div>
      <h3>Todos los Productos</h3>
      <div className={styles.productos_contenedor}>
        {
          Productos.map((producto, index) =>(
            <div key={index} className={styles.producto_contenedor}>
              <p className={styles.producto_nombre}>{producto.Nombre}</p>
              <img src={producto.imagen} className={styles.producto_imagen}></img>
              <p className={styles.producto_precio}>${producto.precioArticulo}</p>
              <p className={styles.producto_descuento}>{producto.descuento}% dto</p>
              <button onClick={()=>handleAgregar(producto)}>Agregar<span><MdAddShoppingCart /></span></button>
            </div>
          ))
        }

      </div>
    </div>
  )
}
