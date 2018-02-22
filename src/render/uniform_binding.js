// @flow

const assert = require('assert');
const util = require('../util/util');

import type Context from '../gl/context';

export interface UniformInterface<T> {
    context: Context;
    set(location: WebGLUniformLocation, value: T): void;
}

export type UniformValues = {[string]: number | Array<number> | Float32Array};
export type UniformLocations = {[string]: WebGLUniformLocation};

class Uniform<T> {
    context: Context;
    current: T;

    constructor(context: Context) {
        this.context = context;
    }

    set(location: WebGLUniformLocation, v: T) {
        let diff = false;
        if (!this.current && v) {
            diff = true;
        } else if (Array.isArray(this.current) && Array.isArray(v) && this.current !== v) {
            for (let i = 0; i < this.current.length; i++) {
                if (this.current[i] !== v[i]) {
                    diff = true;
                    break;
                }
            }
        } else if (this.current !== v) {
            diff = true;
        }

        if (diff) {
            this.current = v;
            this._set(location, v);
        }
    }

    _set(location: WebGLUniformLocation, v: T) {}  // eslint-disable-line
}

class Uniform1i extends Uniform<number> implements UniformInterface<number> {
    _set(location: WebGLUniformLocation, v: number): void {
        this.context.gl.uniform1i(location, v);
    }
}

class Uniform1f extends Uniform<number> implements UniformInterface<number> {
    _set(location: WebGLUniformLocation, v: number): void {
        this.context.gl.uniform1f(location, v);
    }
}

class Uniform2fv extends Uniform<Array<number>> implements UniformInterface<Array<number>> {
    _set(location: WebGLUniformLocation, v: Array<number>): void {
        this.context.gl.uniform2fv(location, v);
    }
}

class Uniform3fv extends Uniform<Array<number>> implements UniformInterface<Array<number>> {
    _set(location: WebGLUniformLocation, v: Array<number>): void {
        this.context.gl.uniform3fv(location, v);
    }
}

class Uniform4fv extends Uniform<Array<number>> implements UniformInterface<Array<number>> {
    _set(location: WebGLUniformLocation, v: Array<number>): void {
        this.context.gl.uniform4fv(location, v);
    }
}

class UniformMatrix4fv extends Uniform<Float32Array> implements UniformInterface<Float32Array> {
    _set(location: WebGLUniformLocation, v: Float32Array): void {
        this.context.gl.uniformMatrix4fv(location, false, v);
    }
}

class Uniforms {
    bindings: Object;

    constructor(bindings: Object) {
        this.bindings = bindings;
    }

    set(uniformLocations: UniformLocations, uniformValues: UniformValues) {
        for (const name in uniformValues) {
            assert(this.bindings[name], `No binding with name ${name}`);
            this.bindings[name].set(uniformLocations[name], uniformValues[name]);
        }
    }

    concatenate(otherUniforms: Uniforms) {      // review: check copying overhead -- maybe not
        this.bindings = util.extend(this.bindings, otherUniforms.bindings);
        return this;
    }
}

module.exports = {
    Uniform1i,
    Uniform1f,
    Uniform2fv,
    Uniform3fv,
    Uniform4fv,
    UniformMatrix4fv,
    Uniforms
};
