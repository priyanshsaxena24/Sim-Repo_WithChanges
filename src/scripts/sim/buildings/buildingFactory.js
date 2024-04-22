import { BuildingType } from './buildingType.js';
import { CommercialZone } from './zones/commercial.js';
import { ResidentialZone } from './zones/residential.js';
import { IndustrialZone } from './zones/industrial.js';
import { Road } from './transportation/road.js';
import { Building } from './building.js';
import { PowerPlant } from './power/powerPlant.js';
import { PowerLine } from './power/powerLine.js';

/**
 * Creates a new building object
 * @param {number} x The x-coordinate of the building
 * @param {number} y The y-coordinate of the building
 * @param {string} type The building type
 * @returns {Building} A new building object
 */
// export function createBuilding(x, y, type) {
//   switch (type) {
//     case BuildingType.residential: 
//       return new ResidentialZone();
//     case BuildingType.commercial: 
//       return new CommercialZone();
//     case BuildingType.industrial: 
//       return new IndustrialZone();
//     case BuildingType.road: 
//       return new Road();
//     case BuildingType.powerPlant:
//       return new PowerPlant();
//     case BuildingType.powerLine:
//       return new PowerLine();
//     default:
//       console.error(`${type} is not a recognized building type.`);
//   }
// }


export function createBuilding(x, y, buildingType) {
  // Switch on buildingType.type because it's an object now, not just a string
  switch (buildingType.type) {
    case 'residential': 
      return new ResidentialZone();
    case 'commercial': 
      return new CommercialZone();
    case 'industrial': 
      return new IndustrialZone();
    case 'road': 
      return new Road();
    case 'powerPlant':
      return new PowerPlant();
    case 'powerLine':
      return new PowerLine();
    default:
      console.error(`${buildingType.type} is not a recognized building type.`);
  }
}
