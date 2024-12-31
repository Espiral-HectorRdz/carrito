import { useEffect, useState } from 'react';

export default function useGrupoLinea() {
    // Recuperar grupoId desde localStorage y decodificarlo desde Base64
    const [grupoId, setGrupoId] = useState(() => {
        const storedId = localStorage.getItem("grupoId");
        return storedId ? JSON.parse(atob(storedId)) : null; // Decodificar Base64 y luego parsear
    });

    // Recuperar lineaId desde localStorage y decodificarlo desde Base64
    const [lineaId, setLineaId] = useState(() => {
        const storedId = localStorage.getItem("lineaId");
        return storedId ? JSON.parse(atob(storedId)) : null; // Decodificar Base64 y luego parsear
    });

    const [lastRoute, setLastRoute] = useState("");

    // Guardar grupoId en localStorage codificado en Base64
    useEffect(() => {
        if (grupoId !== null) {
            const encodedGrupoId = btoa(JSON.stringify(grupoId)); // Codificar a Base64
            localStorage.setItem("grupoId", encodedGrupoId);
        }
    }, [grupoId]);

    // Guardar lineaId en localStorage codificado en Base64
    useEffect(() => {
        if (lineaId !== null) {
            const encodedLineaId = btoa(JSON.stringify(lineaId)); // Codificar a Base64
            localStorage.setItem("lineaId", encodedLineaId);
        }
    }, [lineaId]);

    return {
        grupoId,
        setGrupoId,
        lineaId,
        setLineaId,
        lastRoute,
        setLastRoute
    };
}



