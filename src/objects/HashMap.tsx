import ArrayList from './ArrayList';

export default class HashMap<K extends string | number, V> {

  put(key : K, value : V) {
    if (value === null || value === undefined) {
      this.remove(key);
    }
    // @ts-ignore
    this[key] = value;
  }

  remove(key : string | number) {
    // @ts-ignore
    this[key] = undefined;
  }

  containsKey(key : K):boolean {
    // @ts-ignore
    return this[key] !== undefined;
  }

  get(key : K) : V {
    // @ts-ignore
    return this[key];
  }

  size() : number {
    return this.keys().length;
  }

  clear() {
    this.keys().forEach(this.remove);
  }

  values() : V[] {
    const values: any[] = [];
    Object.keys(this).forEach((key) => {
      // @ts-ignore
      if (this[key] !== undefined) {
        // @ts-ignore
        values.push(this[key]);
      }
    });
    return values;
  }

  keys() : (string | number)[] {
    return Object.keys(this);
  }

  iterate(func: (key : K, value : V, index : number) => void) {
    Object.keys(this).forEach((key, index, map) => {
      // @ts-ignore
      if (this[key] !== undefined) {
        // @ts-ignore
        func(key, this[key], index);
      }
    });
  }

  toArray(parse : boolean = false) : ArrayList<{key:string, value:V}> {
    const array = new ArrayList<{key:string, value:V}>();

    this.iterate((key, value) => {
      // @ts-ignore
      if (value !== undefined) {
        // @ts-ignore
        array.add(new KeyValue(`${key}`, parse ? JSON.parse(value) : value));
      }
    });

    return array;
  }


  /**
     *
     * _get = (key) =>{
        for(var i=0, couplet; couplet = this[i]; i++){
            if(couplet[0] === key){
                return couplet;
            }
        }
    }
     put = (key, value)=>{
        var couplet = this._get(key);
        if(couplet){
            couplet[1] = value;
        }else{
            this.push([key, value]);
        }
        return this; // for chaining
    }
     get = (key) =>{
        var couplet = this._get(key);
        if(couplet){
            return couplet[1];
        }
    }
     *
     */

}
