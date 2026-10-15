import { REGIONS, REGION_LABEL } from "@/lib/constants";

type Geo = {
  points: string;
  cx: number;
  cy: number;
};

// Carte stylisée (mosaïque) du Mali : un tracé géographiquement approximatif par
// région suffit pour le MVP (pas de Mapbox / Google Maps / GeoJSON externe).
// Nord en haut, ouest à gauche.
const GEO: Record<string, Geo> = {
  taoudenit: { points: "0,0 310,0 310,130 0,130", cx: 155, cy: 65 },
  kidal: { points: "310,0 620,0 620,130 310,130", cx: 465, cy: 65 },
  tombouctou: { points: "0,130 300,130 300,270 0,270", cx: 150, cy: 200 },
  gao: { points: "300,130 620,130 620,270 300,270", cx: 460, cy: 200 },
  kayes: { points: "0,270 150,270 150,500 0,500", cx: 75, cy: 385 },
  koulikoro: { points: "150,270 300,270 300,500 150,500", cx: 225, cy: 350 },
  segou: { points: "300,270 440,270 440,410 300,410", cx: 370, cy: 340 },
  mopti: { points: "440,270 540,270 540,410 440,410", cx: 490, cy: 340 },
  menaka: { points: "540,270 620,270 620,500 540,500", cx: 580, cy: 385 },
  bamako: { points: "150,410 215,410 215,470 150,470", cx: 182, cy: 440 },
  sikasso: { points: "300,410 540,410 540,500 300,500", cx: 420, cy: 455 },
};

function buildHref(region: string, selectedSecteur?: string | null) {
  const params = new URLSearchParams();
  if (selectedSecteur) params.set("secteur", selectedSecteur);
  if (region) params.set("region", region);
  const qs = params.toString();
  return qs ? `/carte?${qs}` : "/carte";
}

export default function MaliMap({
  selectedRegion,
  selectedSecteur,
  activeRegions,
}: {
  selectedRegion?: string | null;
  selectedSecteur?: string | null;
  activeRegions: string[];
}) {
  return (
    <svg
      viewBox="0 0 620 500"
      role="img"
      aria-label="Carte des régions du Mali"
      className="w-full max-w-2xl"
    >
      <defs>
        <filter id="mapShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="1" stdDeviation="3" floodOpacity="0.15" />
        </filter>
      </defs>
      <g filter="url(#mapShadow)">
        {REGIONS.filter((r) => GEO[r.value]).map((region) => {
          const geo = GEO[region.value];
          const isSelected = selectedRegion === region.value;
          const isActive = activeRegions.includes(region.value);
          const fill = isSelected ? "#1F3864" : isActive ? "#B8860B" : "#d3dae6";
          const textColor = isSelected || isActive ? "#ffffff" : "#475569";

          return (
            <a
              key={region.value}
              href={buildHref(region.value, selectedSecteur)}
              aria-label={`Région ${region.label}`}
            >
              <polygon
                points={geo.points}
                fill={fill}
                stroke="#ffffff"
                strokeWidth={2}
                className="transition-colors"
                style={{ cursor: "pointer" }}
              />
              <text
                x={geo.cx}
                y={geo.cy}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="13"
                fontWeight={isSelected ? 700 : 500}
                fill={textColor}
                className="pointer-events-none select-none"
              >
                {region.label}
              </text>
            </a>
          );
        })}
      </g>
      <text x={0} y={514} fontSize="11" fill="#94a3b8">
        Carte stylisée des régions et districts du Mali — cliquez sur une région.
      </text>
    </svg>
  );
}
