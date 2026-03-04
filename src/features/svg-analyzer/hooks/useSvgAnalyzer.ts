import { useCallback, useState } from 'react';
import { calculatePolygonArea, parseSVGPath, Point } from '../utils/areaCalculations';

interface SvgData {
  paths: string[];
  originalContent: string;
  viewBox: { x: number; y: number; width: number; height: number };
  objectViewBox: { x: number; y: number; width: number; height: number };
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
      const vbxParts = viewBoxStr ? viewBoxStr.split(/[\s,]+/).map(Number) : [];
      let [vbx, vby, vbw, vbh] = vbxParts.length === 4 ? vbxParts : [0, 0, 0, 0];

      if (vbw === 0 || vbh === 0) {
        vbw = parseFloat(svgElement.getAttribute('width') || '0');
        vbh = parseFloat(svgElement.getAttribute('height') || '0');
      }

      const getPathData = (el: Element): string => {
        const tagName = el.localName.toLowerCase();
        if (tagName === 'path') return el.getAttribute('d') || '';
        if (tagName === 'rect') {
          const x = parseFloat(el.getAttribute('x') || '0');
          const y = parseFloat(el.getAttribute('y') || '0');
          const w = parseFloat(el.getAttribute('width') || '0');
          const h = parseFloat(el.getAttribute('height') || '0');
          const rx = parseFloat(el.getAttribute('rx') || el.getAttribute('ry') || '0');
          const ry = parseFloat(el.getAttribute('ry') || el.getAttribute('rx') || '0');

          if (rx > 0 || ry > 0) {
            const r_x = Math.min(rx, w / 2);
            const r_y = Math.min(ry, h / 2);
            return `M ${x + r_x} ${y} H ${x + w - r_x} A ${r_x} ${r_y} 0 0 1 ${x + w} ${y + r_y} V ${y + h - r_y} A ${r_x} ${r_y} 0 0 1 ${x + w - r_x} ${y + h} H ${x + r_x} A ${r_x} ${r_y} 0 0 1 ${x} ${y + h - r_y} V ${y + r_y} A ${r_x} ${r_y} 0 0 1 ${x + r_x} ${y} Z`;
          }
          return `M ${x} ${y} H ${x + w} V ${y + h} H ${x} Z`;
        }
        if (tagName === 'circle' || tagName === 'ellipse') {
          const cx = parseFloat(el.getAttribute('cx') || '0');
          const cy = parseFloat(el.getAttribute('cy') || '0');
          const rx = tagName === 'circle' ? parseFloat(el.getAttribute('r') || '0') : parseFloat(el.getAttribute('rx') || '0');
          const ry = tagName === 'circle' ? parseFloat(el.getAttribute('r') || '0') : parseFloat(el.getAttribute('ry') || '0');
          return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
        }
        if (tagName === 'polygon' || tagName === 'polyline') {
          return `M ${el.getAttribute('points') || ''}${tagName === 'polygon' ? ' Z' : ''}`;
        }
        return '';
      };

      const parseTransform = (transform: string | null): number[] => {
        const matrix = [1, 0, 0, 1, 0, 0];
        if (!transform) return matrix;
        const regex = /(\w+)\(([^)]+)\)/g;
        let match;
        while ((match = regex.exec(transform)) !== null) {
          const type = match[1].toLowerCase();
          const args = (match[2].match(/-?\d*\.?\d+(?:[eE][-+]?\d+)?/g) || []).map(Number);
          if (type === 'translate') {
            matrix[4] += args[0] || 0;
            matrix[5] += args[1] || 0;
          } else if (type === 'scale') {
            const sx = args[0] || 1;
            const sy = args[1] ?? sx;
            matrix[0] *= sx;
            matrix[3] *= sy;
          } else if (type === 'matrix' && args.length === 6) {
            return args;
          }
        }
        return matrix;
      };

      const pathDataStrings: string[] = [];
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      let totalArea = 0;

      const graphicElements = Array.from(svgElement.querySelectorAll('path, rect, circle, ellipse, polygon, polyline'));

      graphicElements.forEach(el => {
        let accumulatedMatrix = [1, 0, 0, 1, 0, 0];
        let node: Node | null = el;
        while (node && node !== svgElement) {
          if (node instanceof SVGElement) {
            const m = parseTransform(node.getAttribute('transform'));
            accumulatedMatrix[4] = accumulatedMatrix[4] * m[0] + m[4];
            accumulatedMatrix[5] = accumulatedMatrix[5] * m[3] + m[5];
            accumulatedMatrix[0] *= m[0];
            accumulatedMatrix[3] *= m[3];
          }
          node = node.parentNode;
        }

        const d = getPathData(el);
        if (!d) return;

        const polygons = parseSVGPath(d);
        polygons.forEach(pnts => {
          if (pnts.length < 3) return;

          const points = pnts.map(p => ({
            x: p.x * accumulatedMatrix[0] + accumulatedMatrix[4],
            y: p.y * accumulatedMatrix[3] + accumulatedMatrix[5]
          }));

          const area = calculatePolygonArea(points);
          const isBackground = Math.abs(Math.abs(area) - (vbw * vbh)) < (vbw * vbh * 0.05);
          if (isBackground && graphicElements.length > 1) return;

          totalArea += area;
          pathDataStrings.push(d);
          points.forEach(p => {
            if (p.x < minX) minX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.x > maxX) maxX = p.x;
            if (p.y > maxY) maxY = p.y;
          });
        });
      });

      if (pathDataStrings.length === 0 && totalArea === 0) {
        throw new Error('No se encontraron formas gráficas para calcular.');
      }

      const previewClone = svgElement.cloneNode(true) as SVGElement;
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
        totalAreaInSvgUnits: Math.abs(totalArea)
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error analizando SVG');
      setSvgData(null);
    }
  }, []);

  const reset = useCallback(() => {
    setSvgData(null);
    setError(null);
  }, []);

  return { analyzeSvg, reset, svgData, error };
};
