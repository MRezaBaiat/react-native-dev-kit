export default class ArrayList<T> extends Array<T> {

  contains(value : T) : boolean {
    return this.indexOf(value) !== -1;
  }

  add(value : T) : ArrayList<T> {
    this.push(value);
    return this;
  }

  addAll(values : T[]) : ArrayList<T> {
    for (const t of values) {
      this.add(t);
    }
    return this;
  }

  get(index : number) {
    return this[index];
  }

  set(index : number, value : T) {
    this.splice(index, 0, value);
  }

  removeValue(value : T) : ArrayList<T> {
    if (!this.contains(value)) {
      return this;
    }
    this.removeIndex(this.indexOf(value));
    return this;
  }

  removeIndex(index:number) {
    this.splice(index, 1);
  }

  isEmpty() {
    return this.size() === 0;
  }

  size() : number {
    return this.length;
  }

  clear() {
    this.length = 0;
  }
}


// @ts-ignore
Array.prototype.contains = ArrayList.prototype.contains;
// @ts-ignore
Array.prototype.add = ArrayList.prototype.add;
// @ts-ignore
Array.prototype.addAll = ArrayList.prototype.addAll;
// @ts-ignore
Array.prototype.get = ArrayList.prototype.get;
// @ts-ignore
Array.prototype.set = ArrayList.prototype.set;
// @ts-ignore
Array.prototype.removeValue = ArrayList.prototype.removeValue;
// @ts-ignore
Array.prototype.removeIndex = ArrayList.prototype.removeIndex;
// @ts-ignore
Array.prototype.isEmpty = ArrayList.prototype.isEmpty;
// @ts-ignore
Array.prototype.size = ArrayList.prototype.size;
// @ts-ignore
Array.prototype.clear = ArrayList.prototype.clear;
// @ts-ignore
