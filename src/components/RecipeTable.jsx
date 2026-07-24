import { formatNumber } from '../utils/format.js';

const ROWS = [
  ['parisonCutMm', 'Parison cut', 'mm'],
  ['moldTemperatureC', 'Température moule', '°C'],
  ['preheatTemperatureC', 'Température préchauffage', '°C'],
  ['preheatTimeSec', 'Temps préchauffage', 's'],
  ['stretchDistanceMm', 'Stretch distance', 'mm'],
  ['stretchSpeedMmSec', 'Stretch speed', 'mm/s'],
  ['blowPressureBar', 'Pression blow', 'bar'],
  ['blowTimeSec', 'Temps blow', 's'],
  ['coolingTimeSec', 'Temps cooling', 's'],
  ['gripperForceN', 'Force gripper', 'N'],
  ['airJacketPressureBar', 'Air jacket pressure', 'bar'],
  ['waterJacketFlowLMin', 'Water jacket flow', 'L/min'],
  ['estimatedCycleTimeSec', 'Cycle time estimé', 's'],
];

export default function RecipeTable({ recipe, editable = false, onChange }) {
  const parameters = recipe?.parameters ?? {};

  function updateParam(key, value) {
    onChange?.({
      ...recipe,
      parameters: {
        ...parameters,
        [key]: Number(value),
      },
    });
  }

  if (!recipe) {
    return <div className="empty-state">Aucun paramètre généré pour le moment.</div>;
  }

  return (
    <div className="recipe-table-wrap">
      <table className="recipe-table">
        <thead>
          <tr>
            <th>Paramètre BFM</th>
            <th>Valeur</th>
            <th>Unité</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(([key, label, unit]) => (
            <tr key={key}>
              <td>{label}</td>
              <td>
                {editable ? (
                  <input
                    type="number"
                    step="0.1"
                    value={parameters[key] ?? ''}
                    onChange={(event) => updateParam(key, event.target.value)}
                  />
                ) : (
                  <strong>{formatNumber(parameters[key], key.includes('Pressure') ? 2 : 1)}</strong>
                )}
              </td>
              <td>{unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
