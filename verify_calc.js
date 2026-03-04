// Simulación de los cálculos internos para verificación
const testResinCalculation = () => {
    // Caso de prueba del usuario: 10x10cm, grosor 0.12cm
    const width = 10;
    const height = 10;
    const thickness = 0.12;
    
    const area = width * height; // 100
    const volume = area * thickness; // 12
    
    const catalyst = volume / 3; // 4
    const resin = (volume / 3) * 2; // 8
    
    console.log(`--- Test Verification ---`);
    console.log(`Area: ${area} cm2`);
    console.log(`Volumen Total: ${volume} ml`);
    console.log(`Resina: ${resin} ml`);
    console.log(`Catalizador: ${catalyst} ml`);
    
    if (volume === 12 && resin === 8 && catalyst === 4) {
        console.log("¡CÁLCULO CORRECTO!");
    } else {
        console.log("¡ERROR EN EL CÁLCULO!");
    }
};

testResinCalculation();
