import { useCallback, useState } from 'react';
import { calculatePolygonArea, parseSVGPath, Point } from '../utils/areaCalculations';

interface SvgData {
  paths: string[];
  originalContent: string;
  viewBox: { x: number; y: number; width: number; height: number }; // ViewBox original del archivo
  objectViewBox: { x: number; y: number; width: number; height: number }; // Bounding Box real de los objetos
  totalAreaInSvgUnits: number;
}

export const useSvgAnalyzer = () => {
  const [svgData, setSvgData] = useState<SvgData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeSvg = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'image/svg+xml');
      const svgElement = doc.querySelector('svg');

      if (!svgElement) {
        throw new Error('Archivo SVG no válido: No se encontró el elemento <svg>');
      }

      const viewBoxStr = svgElement.getAttribute('viewBox');
      let vbx = 0, vby = 0, vbw = 0, vbh = 0;

      if (viewBoxStr) {
        const parts = viewBoxStr.split(/[\s,]+/).map(Number);
        if (parts.length === 4) {
          [vbx, vby, vbw, vbh] = parts;
        }
      }

      if (vbw === 0 || vbh === 0) {
        vbw = parseFloat(svgElement.getAttribute('width') || '0');
        vbh = parseFloat(svgElement.getAttribute('height') || '0');
      }

      const allElements = Array.from(svgElement.querySelectorAll('*'));
      const pathDataStrings: string[] = [];

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      let totalArea = 0;

      allElements.forEach(el => {
        let d = '';
        const tagName = el.localName.toLowerCase();

        // Ignorar elementos invisibles o estructurales
        if (['defs', 'metadata', 'style', 'title', 'desc'].includes(tagName)) return;

        if (tagName === 'path') {
          d = el.getAttribute('d') || '';
        } else if (tagName === 'rect') {
          const rx = parseFloat(el.getAttribute('x') || '0');
          const ry = parseFloat(el.getAttribute('y') || '0');
          const rw = parseFloat(el.getAttribute('width') || '0');
          const rh = parseFloat(el.getAttribute('height') || '0');

          // FILTRADO INTELIGENTE: Ignorar rectángulos que cubren todo el viewBox (son fondos)
          const isBackground = Math.abs(rw - vbw) < 0.1 && Math.abs(rh - vbh) < 0.1 && Math.abs(rx - vbx) < 0.1 && Math.abs(ry - vby) < 0.1;

          if (!isBackground) {
            d = `M ${rx} ${ry} L ${rx + rw} ${ry} L ${rx + rw} ${ry + rh} L ${rx} ${ry + rh} Z`;
          }
        } else if (tagName === 'circle' || tagName === 'ellipse') {
          const cx = parseFloat(el.getAttribute('cx') || '0');
          const cy = parseFloat(el.getAttribute('cy') || '0');
          const rx = tagName === 'circle' ? parseFloat(el.getAttribute('r') || '0') : parseFloat(el.getAttribute('rx') || '0');
          const ry = tagName === 'circle' ? parseFloat(el.getAttribute('r') || '0') : parseFloat(el.getAttribute('ry') || '0');

          // Generar un polígono de 64 puntos para representar el círculo/elipse con alta precisión
          const points = [];
          for (let i = 0; i <= 64; i++) {
            const angle = (i / 64) * 2 * Math.PI;
            const px = cx + rx * Math.cos(angle);
            const py = cy + ry * Math.sin(angle);
            points.push(`${i === 0 ? 'M' : 'L'} ${px} ${py}`);
          }
          d = points.join(' ') + ' Z';
        } else if (tagName === 'polygon' || tagName === 'polyline') {
          const pointsAttr = el.getAttribute('points') || '';
          d = `M ${pointsAttr}${tagName === 'polygon' ? ' Z' : ''}`;
        }

        if (d) {
          pathDataStrings.push(d);
          const points = parseSVGPath(d);
          if (points.length > 2) {
            totalArea += calculatePolygonArea(points);
            points.forEach(p => {
              if (p.x < minX) minX = p.x;
              if (p.y < minY) minY = p.y;
              if (p.x > maxX) maxX = p.x;
              if (p.y > maxY) maxY = p.y;
            });
          }
        }
      });

      if (pathDataStrings.length === 0 && totalArea === 0) {
        throw new Error('No se encontraron formas gráficas para calcular (podría ser un fondo vacío o texto no convertido a curvas).');
      }

      // Crear un clon para la previsualización y limpiar fondos
      const previewClone = svgElement.cloneNode(true) as SVGElement;
      const cloneElements = Array.from(previewClone.querySelectorAll('rect'));
      cloneElements.forEach(el => {
        const rx = parseFloat(el.getAttribute('x') || '0');
        const ry = parseFloat(el.getAttribute('y') || '0');
        const rw = parseFloat(el.getAttribute('width') || '0');
        const rh = parseFloat(el.getAttribute('height') || '0');
        const isBackground = Math.abs(rw - vbw) < 0.1 && Math.abs(rh - vbh) < 0.1 && Math.abs(rx - vbx) < 0.1 && Math.abs(ry - vby) < 0.1;
        if (isBackground) el.remove();
      });

      setSvgData({
        paths: pathDataStrings,
        originalContent: previewClone.innerHTML,
        viewBox: { x: vbx, y: vby, width: vbw, height: vbh },
        objectViewBox: {
          x: minX === Infinity ? vbx : minX,
          y: minY === Infinity ? vby : minY,
          width: (maxX - minX) || vbw,
          height: (maxY - minY) || vbh
        },
        totalAreaInSvgUnits: totalArea
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error analizando SVG');
      setSvgData(null);
    }
  }, []);

  return { analyzeSvg, svgData, error };
};
