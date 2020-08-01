const swapIndex = (array: [],object: any,to: number): []=>{
    // @ts-ignore
    const from = array.indexOf(object);
    if(!object || to > array.length - 1){
        return array;
    }
    const cutOut = array.splice(from, 1)[0];
    array.splice(to, 0, cutOut);
    return array;
};


export default {
    swapIndex
}
