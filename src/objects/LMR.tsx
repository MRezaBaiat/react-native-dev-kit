
export default class LMR<T> {

    succeed : boolean;
    object : T;
    message : string;

    constructor(succeed : boolean, object : T, message? : string) {
      this.succeed = succeed;
      this.object = object;
      this.message = message;
    }

  /* public LMR(boolean succeed,T object){
        this.succeed = succeed;
        this.object = object;
    }

    public LMR(boolean succeed, String message){
        this.succeed = succeed;
        this.message = message;
    }

    public LMR(boolean succeed,T object, String message){
        this.succeed = succeed;
        this.object = object;
        this.message = message;
    }
*/
}
