export interface Point {
  x: number;
  y: number;
}

/**
 * Calcula el área con signo de un polígono usando la fórmula de Shoelace.
 * El signo depende de la orientación (sentido horario o antihorario).
 * @param points Array de puntos que definen el polígono.
 * @returns El área con signo.
 */
export const calculatePolygonArea = (points: Point[]): number => {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return area / 2;
};

/**
 * Convierte un path de SVG en una lista de puntos aproximada.
 * Soporta comandos M, L, H, V, C, S, Q, T y sus versiones en minúsculas (relativas).
 * Las curvas se aproximan mediante interpolación lineal.
 */
/**
 * Convierte un path de SVG en una lista de polígonos (puntos).
 * Soporta comandos M, L, H, V, C, S, Q, T, A y sus versiones en minúsculas.
 * Las curvas se aproximan con alta resolución para garantizar exactitud.
 */
export const parseSVGPath = (pathData: string): Point[][] => {
  const polygons: Point[][] = [];
  let currentPoints: Point[] = [];

  const commandRegex = /([a-df-z])([^a-df-z]*)/ig;
  let match;

  let currentPos: Point = { x: 0, y: 0 };
  let lastControl: Point | null = null;
  let lastQuadraticControl: Point | null = null;
  let startPoint: Point | null = null;
  let lastCommandType: string = '';

  while ((match = commandRegex.exec(pathData)) !== null) {
    const cmd = match[1];
    const argsText = match[2];
    const args = (argsText.match(/-?\d*\.?\d+(?:[eE][-+]?\d+)?/g) || []).map(Number);
    const isRelative = cmd === cmd.toLowerCase();
    const type = cmd.toUpperCase();

    const getX = (val: number) => isRelative ? currentPos.x + val : val;
    const getY = (val: number) => isRelative ? currentPos.y + val : val;

    switch (type) {
      case 'M':
        if (currentPoints.length > 2) {
          polygons.push([...currentPoints]);
        }
        currentPoints = [];
        for (let i = 0; i < args.length; i += 2) {
          currentPos = { x: getX(args[i]), y: getY(args[i + 1]) };
          currentPoints.push({ ...currentPos });
          if (i === 0) startPoint = { ...currentPos };
        }
        lastControl = null;
        lastQuadraticControl = null;
        break;

      case 'L':
        for (let i = 0; i < args.length; i += 2) {
          currentPos = { x: getX(args[i]), y: getY(args[i + 1]) };
          currentPoints.push({ ...currentPos });
        }
        lastControl = null;
        lastQuadraticControl = null;
        break;

      case 'H':
        args.forEach(val => {
          currentPos.x = getX(val);
          currentPoints.push({ ...currentPos });
        });
        lastControl = null;
        lastQuadraticControl = null;
        break;

      case 'V':
        args.forEach(val => {
          currentPos.y = getY(val);
          currentPoints.push({ ...currentPos });
        });
        lastControl = null;
        lastQuadraticControl = null;
        break;

      case 'C': // Cubic Bezier
        for (let i = 0; i + 5 < args.length; i += 6) {
          const cp1 = { x: getX(args[i]), y: getY(args[i + 1]) };
          const cp2 = { x: getX(args[i + 2]), y: getY(args[i + 3]) };
          const dest = { x: getX(args[i + 4]), y: getY(args[i + 5]) };

          for (let t = 0.01; t <= 1; t += 0.01) {
            const x = Math.pow(1 - t, 3) * currentPos.x + 3 * Math.pow(1 - t, 2) * t * cp1.x + 3 * (1 - t) * t * t * cp2.x + Math.pow(t, 3) * dest.x;
            const y = Math.pow(1 - t, 3) * currentPos.y + 3 * Math.pow(1 - t, 2) * t * cp1.y + 3 * (1 - t) * t * t * cp2.y + Math.pow(t, 3) * dest.y;
            currentPoints.push({ x, y });
          }
          currentPos = dest;
          lastControl = cp2;
          lastQuadraticControl = null;
        }
        break;

      case 'S': // Smooth Cubic Bezier
        for (let i = 0; i + 3 < args.length; i += 4) {
          let cp1;
          if ((lastCommandType === 'C' || lastCommandType === 'S') && lastControl) {
            cp1 = { x: 2 * currentPos.x - lastControl.x, y: 2 * currentPos.y - lastControl.y };
          } else {
            cp1 = { ...currentPos };
          }
          const cp2 = { x: getX(args[i]), y: getY(args[i + 1]) };
          const dest = { x: getX(args[i + 2]), y: getY(args[i + 3]) };

          for (let t = 0.01; t <= 1; t += 0.01) {
            const x = Math.pow(1 - t, 3) * currentPos.x + 3 * Math.pow(1 - t, 2) * t * cp1.x + 3 * (1 - t) * t * t * cp2.x + Math.pow(t, 3) * dest.x;
            const y = Math.pow(1 - t, 3) * currentPos.y + 3 * Math.pow(1 - t, 2) * t * cp1.y + 3 * (1 - t) * t * t * cp2.y + Math.pow(t, 3) * dest.y;
            currentPoints.push({ x, y });
          }
          currentPos = dest;
          lastControl = cp2;
          lastQuadraticControl = null;
        }
        break;

      case 'Q': // Quadratic Bezier
        for (let i = 0; i + 3 < args.length; i += 4) {
          const cp = { x: getX(args[i]), y: getY(args[i + 1]) };
          const dest = { x: getX(args[i + 2]), y: getY(args[i + 3]) };

          for (let t = 0.01; t <= 1; t += 0.01) {
            const x = Math.pow(1 - t, 2) * currentPos.x + 2 * (1 - t) * t * cp.x + t * t * dest.x;
            const y = Math.pow(1 - t, 2) * currentPos.y + 2 * (1 - t) * t * cp.y + t * t * dest.y;
            currentPoints.push({ x, y });
          }
          currentPos = dest;
          lastQuadraticControl = cp;
          lastControl = null;
        }
        break;

      case 'T': // Smooth Quadratic Bezier
        for (let i = 0; i + 1 < args.length; i += 2) {
          let cp;
          if ((lastCommandType === 'Q' || lastCommandType === 'T') && lastQuadraticControl) {
            cp = { x: 2 * currentPos.x - lastQuadraticControl.x, y: 2 * currentPos.y - lastQuadraticControl.y };
          } else {
            cp = { ...currentPos };
          }
          const dest = { x: getX(args[i]), y: getY(args[i + 1]) };

          for (let t = 0.01; t <= 1; t += 0.01) {
            const x = Math.pow(1 - t, 2) * currentPos.x + 2 * (1 - t) * t * cp.x + t * t * dest.x;
            const y = Math.pow(1 - t, 2) * currentPos.y + 2 * (1 - t) * t * cp.y + t * t * dest.y;
            currentPoints.push({ x, y });
          }
          currentPos = dest;
          lastQuadraticControl = cp;
          lastControl = null;
        }
        break;

      case 'A': // Elliptical Arc
        for (let i = 0; i + 6 < args.length; i += 7) {
          const rx = Math.abs(args[i]);
          const ry = Math.abs(args[i + 1]);
          const xAxisRotation = args[i + 2] * (Math.PI / 180);
          const largeArcFlag = args[i + 3];
          const sweepFlag = args[i + 4];
          const destX = getX(args[i + 5]);
          const destY = getY(args[i + 6]);

          if (currentPos.x === destX && currentPos.y === destY) continue;
          if (rx === 0 || ry === 0) {
            currentPos = { x: destX, y: destY };
            currentPoints.push({ ...currentPos });
            continue;
          }

          // Implementación de conversión de endpoint a centro (Spec SVG)
          const dx2 = (currentPos.x - destX) / 2;
          const dy2 = (currentPos.y - destY) / 2;
          const cosPhi = Math.cos(xAxisRotation);
          const sinPhi = Math.sin(xAxisRotation);

          const x1_ = cosPhi * dx2 + sinPhi * dy2;
          const y1_ = -sinPhi * dx2 + cosPhi * dy2;

          let lambda = (x1_ * x1_) / (rx * rx) + (y1_ * y1_) / (ry * ry);
          let actualRx = rx;
          let actualRy = ry;
          if (lambda > 1) {
            actualRx *= Math.sqrt(lambda);
            actualRy *= Math.sqrt(lambda);
          }

          const rxSq = actualRx * actualRx;
          const rySq = actualRy * actualRy;
          const x1_Sq = x1_ * x1_;
          const y1_Sq = y1_ * y1_;

          let factor = (rxSq * rySq - rxSq * y1_Sq - rySq * x1_Sq) / (rxSq * y1_Sq + rySq * x1_Sq);
          factor = Math.sqrt(Math.max(0, factor));
          if (largeArcFlag === sweepFlag) factor = -factor;

          const cx_ = factor * (actualRx * y1_) / actualRy;
          const cy_ = factor * -(actualRy * x1_) / actualRx;

          const cx = cosPhi * cx_ - sinPhi * cy_ + (currentPos.x + destX) / 2;
          const cy = sinPhi * cx_ + cosPhi * cy_ + (currentPos.y + destY) / 2;

          const startAngle = Math.atan2((y1_ - cy_) / actualRy, (x1_ - cx_) / actualRx);
          let endAngle = Math.atan2((-y1_ - cy_) / actualRy, (-x1_ - cx_) / actualRx);

          if (!sweepFlag && endAngle > startAngle) endAngle -= 2 * Math.PI;
          if (sweepFlag && endAngle < startAngle) endAngle += 2 * Math.PI;

          const segments = 50;
          for (let j = 1; j <= segments; j++) {
            const angle = startAngle + (endAngle - startAngle) * (j / segments);
            const x = cosPhi * actualRx * Math.cos(angle) - sinPhi * actualRy * Math.sin(angle) + cx;
            const y = sinPhi * actualRx * Math.cos(angle) + cosPhi * actualRy * Math.sin(angle) + cy;
            currentPoints.push({ x, y });
          }

          currentPos = { x: destX, y: destY };
          lastControl = null;
          lastQuadraticControl = null;
        }
        break;

      case 'Z':
        if (startPoint) {
          currentPos = { ...startPoint };
          currentPoints.push({ ...currentPos });
          polygons.push([...currentPoints]);
          currentPoints = [];
        }
        lastControl = null;
        lastQuadraticControl = null;
        break;
    }
    lastCommandType = type;
  }

  if (currentPoints.length > 2) {
    polygons.push(currentPoints);
  }

  return polygons;
};
