const swapIndex = (array: [],from: number,to: number): []=>{
    const object = array[from];
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
