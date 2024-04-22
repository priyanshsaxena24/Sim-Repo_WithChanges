import * as THREE from "three";
import { BuildingType } from "./buildings/buildingType.js";
import { createBuilding } from "./buildings/buildingFactory.js";
import { Tile } from "./tile.js";
import { VehicleGraph } from "./vehicles/vehicleGraph.js";
import { PowerService } from "./services/power.js";
import { SimService } from "./services/simService.js";
import { updateFundsUI } from "../ui.js";


window.globalAmount = 1000;

export class City extends THREE.Group {
  /**
   * Separate group for organizing debug meshes so they aren't included
   * in raycasting checks
   * @type {THREE.Group}
   */
  debugMeshes = new THREE.Group();
  /**
   * Root node for all scene objects
   * @type {THREE.Group}
   */
  root = new THREE.Group();
  /**
   * List of services for the city
   * @type {SimService}
   */
  services = [];
  /**
   * The size of the city in tiles
   * @type {number}
   */
  size = 16;
  /**
   * The current simulation time
   */
  simTime = 0;
  /**
   * 2D array of tiles that make up the city
   * @type {Tile[][]}
   */
  tiles = [];
  /**
   *
   * @param {VehicleGraph} size
   */
  vehicleGraph;

  constructor(size, name = "My City") {
    super();

    this.name = name;
    this.size = size;

    this.add(this.debugMeshes);
    this.add(this.root);

    this.tiles = [];
    for (let x = 0; x < this.size; x++) {
      const column = [];
      for (let y = 0; y < this.size; y++) {
        const tile = new Tile(x, y);
        tile.refreshView(this);
        this.root.add(tile);
        column.push(tile);
      }
      this.tiles.push(column);
    }

    this.services = [];
    this.services.push(new PowerService());

    this.vehicleGraph = new VehicleGraph(this.size);
    this.debugMeshes.add(this.vehicleGraph);
    this.reloadFunction();
    this.placeBuilding_withcost(12,12, "residential");

  }

  /**
   * The total population of the city
   * @type {number}
   */

  placeBuilding_withoutCost(x, y, buildingTypeKey) {
    const tile = this.getTile(x, y);

    if (tile && !tile.building) {
        const buildingData = BuildingType[buildingTypeKey];
        console.log(buildingData);
        console.log("Building type being created:", buildingData.type);
        if (buildingData) {
            // Ensure buildingData is valid
            console.log("Building type being created:", buildingData.type);
            tile.setBuilding(createBuilding(x, y, buildingData));
            tile.refreshView(this);
          }
        }
      }

  reloadFunction() {
    console.log('The constructor has been reloaded and this function is running!');
    }

  get population() {
    let population = 0;
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile = this.getTile(x, y);
        population += tile.building?.residents?.count ?? 0;
      }
    }
    return population;
  }

  /** Returns the title at the coordinates. If the coordinates
   * are out of bounds, then `null` is returned.
   * @param {number} x The x-coordinate of the tile
   * @param {number} y The y-coordinate of the tile
   * @returns {Tile | null}
   */
  getTile(x, y) {
    if (
      x === undefined ||
      y === undefined ||
      x < 0 ||
      y < 0 ||
      x >= this.size ||
      y >= this.size
    ) {
      return null;
    } else {
      return this.tiles[x][y];
    }
  }

  /**
   * Step the simulation forward by one step
   * @type {number} steps Number of steps to simulate forward in time
   */
  simulate(steps = 1) {
    let count = 0;
    while (count++ < steps) {
      // Update services
      this.services.forEach((service) => service.simulate(this));

      // Update each building
      for (let x = 0; x < this.size; x++) {
        for (let y = 0; y < this.size; y++) {
          this.getTile(x, y).simulate(this);
        }
      }
    }
    this.simTime++;
  }

  /**
   * Places a building at the specified coordinates if the
   * tile does not already have a building on it
   * @param {number} x
   * @param {number} y
   * @param {string} buildingType
   */
  // placeBuilding(x, y, buildingType) {
  //   const tile = this.getTile(x, y);

  //   if (tile && !tile.building) {
  //     const buildingTypeKey = BuildingType[buildingType];
  //     console.log(buildingTypeKey.cost);
  //     if (totalAmountAvailable >= buildingTypeKey.cost) {
  //       tile.setBuilding(createBuilding(x, y, buildingTypeKey.type));
  //       tile.refreshView(this);
  //       totalAmountAvailable -= buildingTypeKey.cost; // Deduct cost from available funds
  //       updateFundsUI(); // Update the UI with new funds total

  //       if (BuildingType[buildingType].type === 'road') {
  //         this.vehicleGraph.updateTile(x, y, tile.building);
  //       }
  //     }
  //     else {
  //       alert("Not enough funds to place this building!");
  //     }

  //     // Update buildings on adjacent tile in case they need to
  //     // change their mesh (e.g. roads)
  //       this.getTile(x - 1, y)?.refreshView(this);
  //       this.getTile(x + 1, y)?.refreshView(this);
  //       this.getTile(x, y - 1)?.refreshView(this);
  //       this.getTile(x, y + 1)?.refreshView(this);

  //     if (tile.building.type === BuildingType.road) {
  //       this.vehicleGraph.updateTile(x, y, tile.building);
  //     }
  //   }
  // }


  placeBuilding_withcost(x, y, buildingTypeKey) {
    const buildingData = BuildingType[buildingTypeKey];
    if (buildingData) {
      if (window.globalAmount >= buildingData.cost) {
        for (let i = 0; i < 2; i++) {
          for (let j = 0; j < 2; j++) {
            const tile = this.getTile(x + i, y + j);
            if (tile && !tile.building) {
              tile.setBuilding(createBuilding(x + i, y + j, buildingData));
              tile.refreshView(this);
            } else {
              console.error(`Cannot place building at (${x + i}, ${y + j}), tile is occupied or does not exist.`);
              return;
            }
          }
        }
        window.globalAmount -= buildingData.cost; // Deduct cost from available funds
        updateFundsUI(); // Update the UI with new funds total
  
        // Refresh surrounding tiles
        for (let i = -1; i <= 4; i++) {
          for (let j = -1; j <= 4; j++) {
            this.getTile(x + i, y + j)?.refreshView(this);
          }
        }
  
        if (buildingData.type === "road") {
          this.vehicleGraph.updateTile(x, y, tile.building);
        }
      } else {
        alert("Not enough funds to place this building!");
      }
    } else {
      console.error(`${buildingTypeKey} is not a recognized building type.`);
    }
  }


  //Mark : Correct hai yeh!
  // placeBuilding_withcost(x, y, buildingTypeKey) {
  //   const tile = this.getTile(x, y);

  //   if (tile && !tile.building) {
  //     const buildingData = BuildingType[buildingTypeKey];
  //     console.log(buildingData);
  //     console.log("Building type being created:", buildingData.type);
  //     if (buildingData) {
  //       // Ensure buildingData is valid
  //       console.log("Building type being created:", buildingData.type);
  //       if (window.globalAmount >= buildingData.cost) {
  //         tile.setBuilding(createBuilding(x, y, buildingData));
  //         tile.refreshView(this);
  //         window.globalAmount -= buildingData.cost; // Deduct cost from available funds
  //         updateFundsUI(); // Update the UI with new funds total

  //         this.getTile(x - 1, y)?.refreshView(this);
  //         this.getTile(x + 1, y)?.refreshView(this);
  //         this.getTile(x, y - 1)?.refreshView(this);
  //         this.getTile(x, y + 1)?.refreshView(this);

  //         if (buildingData.type === "road") {
  //           this.vehicleGraph.updateTile(x, y, tile.building);
  //         }
  //       } else {
  //         alert("Not enough funds to place this building!");
  //       }
  //     } else {
  //       console.error(`${buildingTypeKey} is not a recognized building type.`);
  //     }
  //   }
  // }

  /**
   * Bulldozes the building at the specified coordinates
   * @param {number} x
   * @param {number} y
   */
  bulldoze(x, y) {
    const tile = this.getTile(x, y);

    if (tile.building) {
      if (tile.building.type === BuildingType.road) {
        this.vehicleGraph.updateTile(x, y, null);
      }

      tile.building.dispose();
      tile.setBuilding(null);
      tile.refreshView(this);

      // Update neighboring tiles in case they need to change their mesh (e.g. roads)
      this.getTile(x - 1, y)?.refreshView(this);
      this.getTile(x + 1, y)?.refreshView(this);
      this.getTile(x, y - 1)?.refreshView(this);
      this.getTile(x, y + 1)?.refreshView(this);
    }
  }

  draw() {
    this.vehicleGraph.updateVehicles();
  }

  /**
   * Finds the first tile where the criteria are true
   * @param {{x: number, y: number}} start The starting coordinates of the search
   * @param {(Tile) => (boolean)} filter This function is called on each
   * tile in the search field until `filter` returns true, or there are
   * no more tiles left to search.
   * @param {number} maxDistance The maximum distance to search from the starting tile
   * @returns {Tile | null} The first tile matching `criteria`, otherwiser `null`
   */
  findTile(start, filter, maxDistance) {
    const startTile = this.getTile(start.x, start.y);
    const visited = new Set();
    const tilesToSearch = [];

    // Initialze our search with the starting tile
    tilesToSearch.push(startTile);

    while (tilesToSearch.length > 0) {
      const tile = tilesToSearch.shift();

      // Has this tile been visited? If so, ignore it and move on
      if (visited.has(tile.id)) {
        continue;
      } else {
        visited.add(tile.id);
      }

      // Check if tile is outside the search bounds
      const distance = startTile.distanceTo(tile);
      if (distance > maxDistance) continue;

      // Add this tiles neighbor's to the search list
      tilesToSearch.push(...this.getTileNeighbors(tile.x, tile.y));

      // If this tile passes the criteria
      if (filter(tile)) {
        return tile;
      }
    }

    return null;
  }

  getTileNeighbors(x, y) {
    const neighbors = [];

    if (x > 0) {
      neighbors.push(this.getTile(x - 1, y));
    }
    if (x < this.size - 1) {
      neighbors.push(this.getTile(x + 1, y));
    }
    if (y > 0) {
      neighbors.push(this.getTile(x, y - 1));
    }
    if (y < this.size - 1) {
      neighbors.push(this.getTile(x, y + 1));
    }

    return neighbors;
  }
}
