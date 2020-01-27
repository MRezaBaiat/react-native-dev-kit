import axios, {
  AxiosInstance, AxiosPromise, AxiosResponse, CancelToken,
} from 'axios';

const createCancelToken = () => axios.CancelToken.source();

export default class CallCreator {

    public static axiosInstance : AxiosInstance = axios;

    private headers: {[k:string] : string} = {};

    private body: any;

    private type : string;

    private requestTransformer : (data : any, headers : {[k:string] : string})=>any;

    private responseTransformer : (data : any)=>any;

    private mockAdapter : any;

    private auth : {username : string, password : string};

    private uploadProgressListener : (progressEvent: any)=>void;

    private downloadProgressListener : (progressEvent: any)=>void;

    private methodType : string;

    private maxRedirectsCount : number;

    private mTimeOut : number;

    private url : string;

    private cancelToken: CancelToken;

    public static setDefaultConfig(baseUrl? : string, timeout? : number, headers? : {[k:string] : string}) {
      this.axiosInstance = axios.create({
        baseURL: baseUrl,
        timeout,
        headers,
      });
    }

    public constructor(url : string) {
      this.url = url;
    }

    public setUrl(url : string) : CallCreator {
      this.url = url;
      return this;
    }

    public appendFile(filePath: string, key: string = 'file', fileType: string = 'image/webp', fileName: string = 'photo.webp'): CallCreator {
      this.createDefaultBody();
      if (!filePath.startsWith('file://')) {
        filePath = `file://${filePath}`;
      }

      this.body.append(key, {
        // @ts-ignore
        uri: filePath,
        type: fileType,
        name: fileName,
      });
      return this;
    }

    public appendData(key: string, value: any): CallCreator {
      this.createDefaultBody();
      this.body.append(key, value);
      return this;
    }

    private createDefaultBody() {
      if (!this.body) {
        this.body = new FormData();
      }
    }

    public addHeadersObject(headers : {[k:string] : string}, encode : boolean = false) : CallCreator {
      for (const key of Object.keys(headers)) {
        this.addHeader(key, headers[key], encode);
      }
      return this;
    }

    public addHeaders(headers : {[k:string] : string}, encode : boolean = false) : CallCreator {
      if (encode) {
        headers = { ...headers };
        Object.keys(headers).forEach((value) => {
          headers[value] = encodeURIComponent(headers[value]);
        });
      }
      this.headers = { ...headers, ...this.headers };
      return this;
    }

    public addHeader(k : string, v : string, encode : boolean = true) : CallCreator {
      this.headers[k] = encode ? encodeURIComponent(v) : v;
      return this;
    }

    // `data` is the data to be sent as the request body
    // Only applicable for request methods 'PUT', 'POST', and 'PATCH'
    // When no `transformRequest` is set, must be of one of the following types:
    // - string, plain object, ArrayBuffer, ArrayBufferView, URLSearchParams
    // - Browser only: FormData, File, Blob
    // - Node only: Stream, Buffer
    public addBody(body: string | {} | FormData) : CallCreator {
      this.body = body;
      return this;
    }

    public responseType(type : string) : CallCreator {
      this.type = type;
      return this;
    }

    public maxRedirects(count : number) : CallCreator {
      this.maxRedirectsCount = count;
      return this;
    }

    public responseTimeOut(timeOut : number) : CallCreator {
      this.mTimeOut = timeOut;
      return this;
    }

    public method(type : string) : CallCreator {
      this.methodType = type;
      return this;
    }

    public setRequestTransformer(transformer : (data : any, headers : {[k:string] : string})=>any) : CallCreator {
      this.requestTransformer = transformer;
      return this;
    }

    public setResponseTransformer(transformer : (data : any)=>any) : CallCreator {
      this.responseTransformer = transformer;
      return this;
    }

    public setMockAdapter(adapter : any) : CallCreator {
      this.mockAdapter = adapter;
      return this;
    }

    public setAuthorization(auth : {username : string, password : string}) : CallCreator {
      this.auth = auth;
      return this;
    }

    public setUploadProgressListener(listener : (progressEvent: any)=>void) : CallCreator {
      this.uploadProgressListener = listener;
      return this;
    }

    public setDownloadProgressListener(listener : (progressEvent: any)=>void) : CallCreator {
      this.uploadProgressListener = listener;
      return this;
    }

    public get() : CallCreator {
      this.methodType = 'GET';
      return this;
    }

    public post() : CallCreator {
      this.methodType = 'POST';
      return this;
    }

    public cancel() {
      if (this.cancelToken) {
        // @ts-ignore
        this.cancelToken.cancel();
      }
    }

    public execute() : AxiosPromise<AxiosResponse> {
      if (!this.methodType && this.body) {
        this.methodType = 'POST';
      }
      // @ts-ignore
      this.cancelToken = createCancelToken().token;
      return CallCreator.axiosInstance.request({
        url: this.url,
        headers: this.headers,
        data: this.body,
        cancelToken: this.cancelToken,
        timeout: this.mTimeOut,
        maxRedirects: this.maxRedirectsCount,
        method: this.methodType,
        responseType: this.type,
        transformRequest: this.requestTransformer,
        transformResponse: this.responseTransformer,
        adapter: this.mockAdapter,
        auth: this.auth,
        onUploadProgress: this.uploadProgressListener,
        onDownloadProgress: this.downloadProgressListener,
      });
    }
}
