export default class CoordSet {
  coords: {[key: number] : {[key : number] : boolean}};

  constructor() {
    this.coords = {};
  }

  addCoord(x: number, y: number) {
    if (!(x in this.coords)) {
      this.coords[x] = {};
    }
    this.coords[x][y] = true;
  }

  hasCoord(x: number, y: number): boolean {
    return (x in this.coords) && this.coords[x][y];
  }
}