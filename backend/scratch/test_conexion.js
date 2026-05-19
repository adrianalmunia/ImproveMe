const net = require('net');

function test(host, port, family) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const start = Date.now();
    console.log(`Intentando conectar a ${host}:${port} usando IPv${family}...`);
    
    socket.connect({
      host: host,
      port: port,
      family: family
    });
    
    socket.on('connect', () => {
      console.log(`✅ ¡Éxito! Conectado a ${host} usando IPv${family} en ${Date.now() - start}ms`);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('error', (err) => {
      console.log(`❌ Fallo en IPv${family}: ${err.message}`);
      socket.destroy();
      resolve(false);
    });
    
    socket.setTimeout(5000);
    socket.on('timeout', () => {
      console.log(`❌ Timeout (5s) en IPv${family}`);
      socket.destroy();
      resolve(false);
    });
  });
}

async function run() {
  const host = 'ep-orange-poetry-al59ex2u.c-3.eu-central-1.aws.neon.tech';
  
  console.log('=== PRUEBA DE CONEXIÓN A NEON ===');
  await test(host, 5432, 4);
}

run();
