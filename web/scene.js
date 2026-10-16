import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";
import { RoundedBoxGeometry } from "https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/geometries/RoundedBoxGeometry.js";

const canvas = document.querySelector("#calculator-scene");
const resultElement = document.querySelector("#result");
const expressionElement = document.querySelector("#expression");

if (canvas) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#13091c");

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
  camera.position.set(0, 0.2, 15.5);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;

  scene.add(new THREE.HemisphereLight("#ffd8ff", "#391447", 2.1));

  const keyLight = new THREE.DirectionalLight("#fff7d6", 4.2);
  keyLight.position.set(-5, 8, 10);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.left = -9;
  keyLight.shadow.camera.right = 9;
  keyLight.shadow.camera.top = 9;
  keyLight.shadow.camera.bottom = -9;
  scene.add(keyLight);

  const fillLight = new THREE.PointLight("#00f5ff", 36, 15);
  fillLight.position.set(5, 1, 6);
  scene.add(fillLight);

  const neonLight = new THREE.PointLight("#ff35d3", 30, 13);
  neonLight.position.set(-4, 2, 5);
  scene.add(neonLight);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80),
    new THREE.MeshStandardMaterial({ color: "#291632", roughness: 0.72, emissive: "#160b20", emissiveIntensity: 0.6 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -3.7;
  floor.receiveShadow = true;
  scene.add(floor);

  const calculator = new THREE.Group();
  scene.add(calculator);

  const shell = new THREE.Mesh(
    new RoundedBoxGeometry(4.05, 6.05, 0.62, 8, 0.2),
    new THREE.MeshStandardMaterial({ color: "#ff35d3", emissive: "#9b087d", emissiveIntensity: 0.72, roughness: 0.24, metalness: 0.18 }),
  );
  shell.castShadow = true;
  shell.receiveShadow = true;
  calculator.add(shell);

  const face = new THREE.Mesh(
    new RoundedBoxGeometry(3.78, 5.76, 0.16, 8, 0.12),
    new THREE.MeshStandardMaterial({ color: "#170d24", emissive: "#210d32", emissiveIntensity: 0.3, roughness: 0.42, metalness: 0.12 }),
  );
  face.position.z = 0.34;
  face.castShadow = true;
  calculator.add(face);

  const screenCanvas = document.createElement("canvas");
  screenCanvas.width = 768;
  screenCanvas.height = 250;
  const screenContext = screenCanvas.getContext("2d");

  function updateScreen() {
    if (!screenContext) return;
    screenContext.fillStyle = "#10091a";
    screenContext.fillRect(0, 0, screenCanvas.width, screenCanvas.height);
    screenContext.fillStyle = "#d7ff00";
    screenContext.font = "500 27px monospace";
    screenContext.fillText("MATEPRO  /  01", 34, 46);
    screenContext.fillStyle = "#00f5ff";
    screenContext.font = "400 29px monospace";
    const expression = expressionElement?.textContent?.trim() || "LISTA PARA CALCULAR";
    screenContext.fillText(expression.slice(0, 27), 34, 102);
    screenContext.fillStyle = "#d7ff00";
    screenContext.font = "500 82px monospace";
    screenContext.textAlign = "right";
    const result = resultElement?.textContent?.trim() || "—";
    screenContext.fillText(result.slice(0, 13), screenCanvas.width - 34, 204);
    screenContext.textAlign = "left";
    screenTexture.needsUpdate = true;
  }

  const screenTexture = new THREE.CanvasTexture(screenCanvas);
  screenTexture.colorSpace = THREE.SRGBColorSpace;
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(3.38, 1.1),
    new THREE.MeshBasicMaterial({ map: screenTexture, toneMapped: false }),
  );
  screen.position.set(0, 1.9, 0.44);
  calculator.add(screen);
  updateScreen();

  const buttonRows = [
    ["AC", "±", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "−"],
    ["1", "2", "3", "+"],
    ["0", ".", "xʸ", "="],
  ];
  const buttonMaterials = ["#f8eaff", "#d7ff00", "#00f5ff", "#9b5cff", "#ff35d3"];
  const darkInk = new THREE.MeshStandardMaterial({ color: "#200b2d", roughness: 0.3 });

  function labelTexture(label, color) {
    const labelCanvas = document.createElement("canvas");
    labelCanvas.width = 256;
    labelCanvas.height = 128;
    const context = labelCanvas.getContext("2d");
    context.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
    context.fillStyle = color;
    context.font = "600 66px monospace";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(label, 128, 65);
    const texture = new THREE.CanvasTexture(labelCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  buttonRows.forEach((row, rowIndex) => {
    row.forEach((label, columnIndex) => {
      const columnX = (columnIndex - 1.5) * 0.86;
      const rowY = 0.72 - rowIndex * 0.83;
      const colorIndex = label === "=" ? 2 : ["÷", "×", "−", "+", "xʸ", "%"].includes(label) ? (rowIndex % 2 ? 3 : 2) : label === "AC" ? 4 : 0;
      const button = new THREE.Mesh(
        new RoundedBoxGeometry(0.75, 0.65, 0.2, 4, 0.1),
        new THREE.MeshStandardMaterial({ color: buttonMaterials[colorIndex], emissive: buttonMaterials[colorIndex], emissiveIntensity: 0.2, roughness: 0.26, metalness: 0.08 }),
      );
      button.position.set(columnX, rowY, 0.46);
      button.castShadow = true;
      button.receiveShadow = true;
      calculator.add(button);

      const ink = [0, 4].includes(colorIndex) ? "#183c36" : "#ffffff";
      const labelMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.55, 0.28),
        new THREE.MeshBasicMaterial({ map: labelTexture(label, ink), transparent: true, toneMapped: false }),
      );
      labelMesh.position.set(columnX, rowY + 0.025, 0.57);
      calculator.add(labelMesh);
    });
  });

  const accentRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.78, 0.075, 16, 80),
    new THREE.MeshStandardMaterial({ color: "#00f5ff", emissive: "#00c8e8", emissiveIntensity: 0.72, roughness: 0.22, metalness: 0.32 }),
  );
  accentRing.position.set(2.4, 1.45, -0.9);
  accentRing.rotation.set(0.45, 0.2, -0.5);
  accentRing.castShadow = true;
  calculator.add(accentRing);

  const marker = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.34, 0),
    new THREE.MeshStandardMaterial({ color: "#d7ff00", emissive: "#8fc400", emissiveIntensity: 0.6, roughness: 0.2, metalness: 0.12, flatShading: true }),
  );
  marker.position.set(-2.45, -1.85, 0.2);
  marker.rotation.set(0.4, 0.4, 0.2);
  marker.castShadow = true;
  calculator.add(marker);

  const observer = new MutationObserver(updateScreen);
  if (resultElement) observer.observe(resultElement, { childList: true, characterData: true, subtree: true });
  if (expressionElement) observer.observe(expressionElement, { childList: true, characterData: true, subtree: true });

  const pointer = new THREE.Vector2();
  const targetRotation = new THREE.Vector2(-0.07, -0.12);
  let viewportWidth = window.innerWidth;
  let animationFrame = 0;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    renderer.setSize(viewportWidth, viewportHeight, false);
    camera.aspect = viewportWidth / Math.max(viewportHeight, 1);
    camera.position.z = viewportWidth < 720 ? 17.5 : 15.5;
    camera.updateProjectionMatrix();
    calculator.scale.setScalar(viewportWidth < 720 ? 0.7 : 1);
    calculator.position.set(viewportWidth < 720 ? 1.55 : 3.65, viewportWidth < 720 ? -1.2 : -0.05, 0);
  }

  function onPointerMove(event) {
    pointer.set(event.clientX / Math.max(window.innerWidth, 1), event.clientY / Math.max(window.innerHeight, 1));
    targetRotation.y = -0.12 + (pointer.x - 0.5) * 0.18;
    targetRotation.x = -0.07 + (pointer.y - 0.5) * 0.12;
  }

  function render(time) {
    animationFrame = requestAnimationFrame(render);
    const seconds = time * 0.001;
    const drift = reducedMotion ? 0 : Math.sin(seconds * 0.72) * 0.075;
    calculator.position.y = (viewportWidth < 720 ? -1.2 : -0.05) + drift;
    calculator.rotation.x += (targetRotation.x - calculator.rotation.x) * 0.035;
    calculator.rotation.y += (targetRotation.y - calculator.rotation.y) * 0.035;
    accentRing.rotation.z += reducedMotion ? 0 : 0.002;
    marker.rotation.y += reducedMotion ? 0 : 0.006;
    renderer.render(scene, camera);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  resize();
  animationFrame = requestAnimationFrame(render);

  window.addEventListener("pagehide", () => {
    cancelAnimationFrame(animationFrame);
    observer.disconnect();
    renderer.dispose();
  }, { once: true });
}