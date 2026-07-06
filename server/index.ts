/* Sfondo animato Galassia */
body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #ffffff;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-x: hidden;
  /* Gradiente cosmico di base */
  background: radial-gradient(circle at bottom, #1b2735 0%, #090a0f 100%);
  position: relative;
}

/* Effetto stelle in movimento */
body::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background-image: 
    radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 40px),
    radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 30px),
    radial-gradient(white, rgba(255,255,255,.1) 2px, transparent 40px);
  background-size: 550px 550px, 350px 350px, 250px 250px;
  background-position: 0 0, 40px 60px, 130px 270px;
  animation: galaxyRotation 120s linear infinite;
  opacity: 0.6;
  z-index: 0;
}

@keyframes galaxyRotation {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Interfaccia di Gioco (I Box del quiz) */
.box, .panel, #login-screen, #game-screen {
  position: relative;
  z-index: 1; /* Rimane sopra le stelle */
  background: rgba(15, 22, 42, 0.75); /* Vetro scuro semi-trasparente */
  backdrop-filter: blur(12px); /* Effetto sfocatura dietro il box */
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5), 
              0 0 15px rgba(138, 43, 226, 0.2); /* Bagliore viola */
  border-radius: 16px;
  padding: 30px;
  max-width: 450px;
  width: 90%;
  text-align: center;
}

/* Input del Testo (Dove inseriscono il nome) */
input[type="text"] {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  color: white;
  font-size: 16px;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

input[type="text"]:focus {
  outline: none;
  border-color: #8a2be2;
  box-shadow: 0 0 10px rgba(138, 43, 226, 0.5);
}

/* Pulsanti delle Risposte in stile Cyberpunk/Spaziale */
button {
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); /* Gradiente viola-blu */
  color: white;
  border: none;
  padding: 14px 20px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  margin: 8px 0;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(37, 117, 252, 0.3);
  text-transform: uppercase;
  letter-spacing: 1px;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(138, 43, 226, 0.6);
  filter: brightness(1.2);
}

button:active {
  transform: translateY(1px);
}

