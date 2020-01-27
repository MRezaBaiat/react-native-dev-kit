import React, { Component } from 'react';
import * as Animatable from 'react-native-animatable';
import { AnimatableComponent, Animation } from 'react-native-animatable';

const isEqual = require('react-fast-compare');

export default class SmartComponent<P = any, S = any, SS = any> extends Component<P, S, SS> {

    protected mRef : Animatable;

    constructor(props : P) {
      super(props);
    }

    /**
     * these 2 lines are the miracle of react-native performance!
     */
    shouldComponentUpdate(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean {
      return !isEqual(this.props, nextProps) || !isEqual(this.state, nextState);
    }

    protected onSetRef = (ref : any) => {
      this.mRef = ref;
    };

    /**
     *
     * refer to createAnimatableComponent for more ...
     *
     * @param animationName see @Animation
     * @param options
     */
    public animate = (animationName : string | Animation, options: number | KeyframeAnimationOptions, delay? : number): Animation =>
      // @ts-ignore
      this.mRef.animate(animationName, options, delay)

}
