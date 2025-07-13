import { DecoratorNode } from 'lexical';
import React from 'react';

export class ImageNode extends DecoratorNode {
  __src;

  static getType() {
    return 'image';
  }

  static clone(node) {
    return new ImageNode(node.__src, node.__key);
  }

  constructor(src, key) {
    super(key);
    this.__src = src;
  }

  createDOM() {
    const img = document.createElement('img');
    img.src = this.__src;
    img.style.maxWidth = '100%';
    img.style.borderRadius = '8px';
    return img;
  }

  updateDOM() {
    return false;
  }

  static importJSON(serializedNode) {
    const node = new ImageNode(serializedNode.src);
    return node;
  }

  exportJSON() {
    return {
      type: 'image',
      version: 1,
      src: this.__src,
    };
  }

  decorate() {
    return <img src={this.__src} alt="" style={{ maxWidth: '100%', borderRadius: '8px' }} />;
  }
}

export function $createImageNode(src) {
  return new ImageNode(src);
}

export function $isImageNode(node) {
  return node instanceof ImageNode;
}
