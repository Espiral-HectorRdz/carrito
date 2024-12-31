import React, { useState, useEffect } from 'react'
import styles from "../menu/menu.module.css"
import { useCarrito } from '../../context/CarritoContext'

export default function Menu() {
  const { usuario } = useCarrito();
    
  return (
    <>
      <div className={styles.overlay}></div>
            <div className={styles.menu_container}>
            <div className={styles.usuario}>
                <p>{usuario}</p>
            </div>
      </div>
    </>
  )
}
