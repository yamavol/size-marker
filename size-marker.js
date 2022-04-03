/**
 * @license 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2022 Yamavol
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights 
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
 * copies of the Software, and to permit persons to whom the Software is 
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in 
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 * @version 0.1.1
 */
class SizeMarker {
  
  /** @enum {number} */
  static Orientation = {
    Horizontal: 0,
    Vertical: 1,
  }

  /** @enum {number} */
  static Position = {
    Default: 0,
    Left: 1,
    Right: 2,
    Top: 3,
    Bottom: 4,
  }

  /** @enum {number} */
  static AnnotationPosition = {
    Default: 0,
    LeftBottom: 1,
    RightBottom: 2,
    LeftTop: 3,
    RightTop: 4,
  }

  /** @enum {number} */
  static Boundary = {
    Margin: 0,
    Border: 1,
    Block: 2,
    Default: 2,
    Padding: 3,
  }

  /** @param {number} x */
  static #floorFract (x) {
    return parseInt(x * 100) / 100.0;
  }

  /** @param {number} x */
  static #px(x) {
    return `${x}px`
  }

  /**
   * @param {Orientation} orientation
   * @param {AnnotationPosition} annotationPosition
   */
  static #resolveAnnotationPosition(orientation, annotationPosition) {
    if (annotationPosition === SizeMarker.AnnotationPosition.Default) {
      if (orientation === SizeMarker.Orientation.Horizontal)
        return SizeMarker.AnnotationPosition.LeftBottom;
      if (orientation === SizeMarker.Orientation.Vertical)
        return SizeMarker.AnnotationPosition.RightTop;
      else
        return SizeMarker.AnnotationPosition.LeftBottom
    }
    return annotationPosition;
  }

  /**
   * @param {Orientation} orientation
   * @param {Position} position 
   */
  static #resoveMarkerPosition(orientation, position) {
    if (position === SizeMarker.Position.Default) {
      if (orientation === SizeMarker.Orientation.Horizontal)
        return SizeMarker.Position.Top;
      if (orientation === SizeMarker.Orientation.Vertical)
        return SizeMarker.Position.Left;
      else
        return SizeMarker.Position.Top;
    }
    return position;
  }

  /**
   * 
   * @param {HTMLElement} targetElement 
   * @param {Option} option 
   */
  static #calcBoundaryOffset(targetElement, option) {
    const boundaryOffset = {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    };

    if (targetElement !== null) {
      const computedStyle = window.getComputedStyle(targetElement);
      const bbox = targetElement.getBoundingClientRect();

      const calcOffset = (function (boundary, margin, border, padding) {
        let offset = 0;
        switch(boundary) {
          case SizeMarker.Boundary.Margin:
            offset -= parseFloat(margin) + parseFloat(border);
            break;
          case SizeMarker.Boundary.Border:
            offset -= parseFloat(border);
            break;
          case SizeMarker.Boundary.Block:
          case SizeMarker.Boundary.Default:
            break;
          case SizeMarker.Boundary.Padding:
            offset += padding;
            break;
        }
        return offset;
      })

      boundaryOffset.top = calcOffset(option.boundaryTop, computedStyle.marginTop, computedStyle.borderTopWidth, bbox.top);
      boundaryOffset.bottom = calcOffset(option.boundaryBottom, computedStyle.marginBottom, computedStyle.borderBottomWidth, bbox.bottom);
      boundaryOffset.left = calcOffset(option.boundaryLeft, computedStyle.marginLeft, computedStyle.borderLeftWidth, bbox.left);
      boundaryOffset.right = calcOffset(option.boundaryRight, computedStyle.marginRight, computedStyle.borderRightWidth, bbox.right);
    }

    return boundaryOffset;
  }

  /**
   * @typedef {Object} Option
   * @property {Orientation} orientation
   * @property {Position} markerPosition
   * @property {AnnotationPosition} annotationPosition
   * @property {number}  markerOffset
   * @property {number}  annotationOffsetH
   * @property {number}  annotationOffsetV
   * @property {Boundary} boundaryLeft
   * @property {Boundary} boundaryRight
   * @property {Boundary} boundaryTop
   * @property {Boundary} boundaryBottom
   * @property {string} borderStyle
   * @property {string} annotationBackground
   */

  /** @type {Option} */
  static DEFAULT_OPTION = {
    orientation: SizeMarker.Orientation.Horizontal,
    markerPosition: SizeMarker.Position.Default,
    markerOffset: 0,
    annotationPosition: SizeMarker.AnnotationPosition.Default,
    annotationOffsetH: 0,
    annotationOffsetV: 0,
    boundaryLeft: SizeMarker.Boundary.Default,
    boundaryRight: SizeMarker.Boundary.Default,
    boundaryTop: SizeMarker.Boundary.Default,
    boundaryBottom: SizeMarker.Boundary.Default,
    borderStyle: '1px solid black',
    annotationBackground: 'white',
    annotationColor: 'inherit',
  }



  /** 
   * @param {HTMLElement} stylingElement
   * @param {HTMLElement} targetElement
   * @param {Option} option
   */
  static #setMarkerElementStyle(stylingElement, targetElement, option) {
    const offset = option.markerOffset;
    const orientation = option.orientation;
    const borderStyle = option.borderStyle;
    const position = SizeMarker.#resoveMarkerPosition(orientation, option.markerPosition);

    const boundaryOffset = SizeMarker.#calcBoundaryOffset(targetElement, option);

    const style = stylingElement.style;
    style.position = 'absolute';
    style.boxSizing = 'border-box';
    style.background = 'transparent';

    switch(orientation) {
      default:
      case SizeMarker.Orientation.Horizontal:
        style.left = SizeMarker.#px(0 + boundaryOffset.left);
        style.right = SizeMarker.#px(0 + boundaryOffset.right);
        style.height = '7px';
        style.borderLeft = borderStyle;
        style.borderRight = borderStyle;

        switch(position) {
          default:
          case SizeMarker.Position.Top:
            style.top = SizeMarker.#px(0 + boundaryOffset.top + offset);
            break;
          case SizeMarker.Position.Bottom:
            style.bottom = SizeMarker.#px(0 + boundaryOffset.bottom + offset);
            break;
        }
        break;


      case SizeMarker.Orientation.Vertical:
        style.top = SizeMarker.#px(0 + boundaryOffset.top);
        style.bottom = SizeMarker.#px(0 + boundaryOffset.bottom);;
        style.width = '7px';
        style.borderTop = borderStyle;
        style.borderBottom = borderStyle;
        
        switch(position) {
          default:
            case SizeMarker.Position.Left:
            style.left = SizeMarker.#px(0 + boundaryOffset.left + offset);
            break;
            case SizeMarker.Position.Right:
              style.right = SizeMarker.#px(0 + boundaryOffset.right + offset);
            break;
        }
        break;

    }
  }

  /** 
   * @param {HTMLElement} elem
   * @param {Option} option
   */
  static #setMarkerPseudoElementStyle(elem, option) {
    elem.style.position = 'absolute';
    
    switch(option.orientation) {
      case SizeMarker.Orientation.Horizontal:
        elem.style.left = '-1px';
        elem.style.right = '-1px';
        elem.style.top = '3px';
        elem.style.height = '1px';
        elem.style.borderTop = option.borderStyle;
        break;
      case SizeMarker.Orientation.Vertical:
        elem.style.top = '-1px';
        elem.style.bottom = '-1px';
        elem.style.left = '3px';
        elem.style.width = '1px';
        elem.style.borderLeft = option.borderStyle;
        break;
    }
  }

  /** 
   * @param {HTMLElement} elem
   * @param {Option} option
   */
  static #setAnnotationElementStyle(elem, option) {
    const orientation = option.orientation;

    const position = SizeMarker.#resolveAnnotationPosition(orientation, option.annotationPosition);

    elem.style.position = 'absolute';
    elem.style.background = option.annotationBackground;
    elem.style.color = option.annotationColor;
    elem.style.margin = '2px';
    elem.style.padding = '3px 20px';
    elem.style.fontSize = '0.5rem';
    elem.style.borderRadius = '3px';
    elem.style.boxShadow = '0px 0px 10px rgba(50,50,50,0.5)';
    elem.style.whiteSpace = 'nowrap';
    switch(orientation) {
      default:
      case SizeMarker.Orientation.Horizontal:
        switch(position) {
          default:
          case SizeMarker.AnnotationPosition.LeftBottom:
            elem.style.left = '0';
            elem.style.top = '50%';
            elem.style.marginTop = '6px';
            break;
          case SizeMarker.AnnotationPosition.LeftTop:
            elem.style.left = '0';
            elem.style.bottom = '50%';
            elem.style.marginBottom = '6px';
            break;
          case SizeMarker.AnnotationPosition.RightBottom:
            elem.style.right = '0';
            elem.style.top = '50%';
            elem.style.marginTop = '6px';
            break;
          case SizeMarker.AnnotationPosition.RightTop:
            elem.style.right = '0';
            elem.style.bottom = '50%';
            elem.style.marginBottom = '6px';
            break;
        }
        break;

      case SizeMarker.Orientation.Vertical:
        switch(position) {
          default:
          case SizeMarker.AnnotationPosition.RightTop:
            elem.style.left = '50%';
            elem.style.top = '0';
            elem.style.marginLeft = '6px';
            break;
          case SizeMarker.AnnotationPosition.LeftTop:
            elem.style.right = '50%';
            elem.style.top = '0';
            elem.style.marginRight = '6px';
            break;
          case SizeMarker.AnnotationPosition.RightBottom:
            elem.style.left = '50%';
            elem.style.bottom = '0';
            elem.style.marginLeft = '6px';
            break;
          case SizeMarker.AnnotationPosition.LeftBottom:
            elem.style.right = '50%';
            elem.style.bottom = '0';
            elem.style.marginRight = '6px';
            break;
        }
    }
    
  }


  /** 
   * @param {HTMLElement} elem
   * @param {Option} option
   */
  static #setAnnotationPseudoElementStyle(elem, option) {
    const orientation = option.orientation;
    let position = SizeMarker.#resolveAnnotationPosition(orientation, option.annotationPosition);

    elem.innerText = '';
    elem.style.position = 'absolute';
    elem.style.background = 'transparent';       
    elem.style.borderTop = '6px solid transparent';
    elem.style.borderBottom = '6px solid transparent';
    elem.style.borderLeft = '6px solid transparent';
    elem.style.borderRight = '6px solid transparent';

    switch(orientation) {
      default:
      case SizeMarker.Orientation.Horizontal:
        elem.style.left = '50%';
        elem.style.marginLeft = '-6px';

        switch(position) {
          default:
          case SizeMarker.AnnotationPosition.LeftBottom:
          case SizeMarker.AnnotationPosition.RightBottom:
            /* point upwards */
            elem.style.top = '0';
            elem.style.marginTop = '-12px';
            elem.style.borderBottom = '6px solid white';
            break;
          case SizeMarker.AnnotationPosition.LeftTop:
          case SizeMarker.AnnotationPosition.RightTop:
            elem.style.bottom = '0';
            elem.style.marginBottom = '-12px';
            elem.style.borderTop = '6px solid white';
            break;
        }
        break;

      case SizeMarker.Orientation.Vertical:
        elem.style.top = '50%';
        elem.style.marginTop = '-6px';

        switch(position) {
          default:
          case SizeMarker.AnnotationPosition.RightTop:
          case SizeMarker.AnnotationPosition.RightBottom:
            /* point left */
            elem.style.left = '0';
            elem.style.marginLeft = '-12px';
            elem.style.borderRight = '6px solid white';
            break;
          case SizeMarker.AnnotationPosition.LeftTop:
          case SizeMarker.AnnotationPosition.LeftBottom:
            elem.style.right = '0';
            elem.style.marginRight = '-12px';
            elem.style.borderLeft = '6px solid white';
            break;
        }
    }
  }


  /**
   * Creates SizeMarker and returns objects
   * 
   * @param {HTMLElement?} targetElement
   * @param {Option} option
   */
  static createMarker(targetElement, option) {

    const _option = Object.assign({}, SizeMarker.DEFAULT_OPTION, option);

    const marker = document.createElement('div');
    
    const markerBar = document.createElement('div');
    const annotation = document.createElement('div');
    const annotationTip = document.createElement('div');
    const annotationText = document.createElement('span');
    
    SizeMarker.#setMarkerElementStyle(marker, targetElement, _option);
    SizeMarker.#setMarkerPseudoElementStyle(markerBar, _option);
    SizeMarker.#setAnnotationElementStyle(annotation, _option);
    SizeMarker.#setAnnotationPseudoElementStyle(annotationTip, _option);

    annotation.appendChild(annotationTip)
    marker.appendChild(markerBar);
    marker.appendChild(annotation);
    annotation.appendChild(annotationText);

    const onresize = function (ev) {
      const bbox = targetElement.getBoundingClientRect();
      const boundaryOffset = SizeMarker.#calcBoundaryOffset(targetElement, _option);
  
      if (_option.orientation === SizeMarker.Orientation.Vertical) {
        const height = SizeMarker.#floorFract(bbox.height + boundaryOffset.top + boundaryOffset.bottom);
        annotationText.textContent = `${height}px`;
      }
      else if (_option.orientation === SizeMarker.Orientation.Horizontal){
        const width = SizeMarker.#floorFract(bbox.width + boundaryOffset.left + boundaryOffset.right);
        annotationText.textContent = `${width}px`;
      }
      else {
        annotationText.textContent = '---'
      }
    };

    onresize(null);

    return {
      marker: marker,
      annotation: annotationText,
      option,
      onresize,
    }
  }

  /**
   * 
   * 
   * @param {HTMLElement} elem
   * @param {Option} options
   */
  static addMarker(elem, options) {
    const currentComputedStyle = window.getComputedStyle(elem);
    switch(currentComputedStyle.position) {
      case 'static':
        elem.style.position = 'relative';
        break;
      case 'absolute':
      case 'relative':
        break;
      default:
        console.warn(`SizeMarker cannot element with position: ${currentComputedStyle.position}`)
        return;
    }

    const marker = SizeMarker.createMarker(elem, options);
    window.addEventListener('resize', marker.onresize);
    elem.appendChild(marker.marker);
  }


  /**
   * @param {HTMLElement} elem 
   * @param {Option} option
   */
  static addHorizontalMarker(elem, option = {}) {
    SizeMarker.addMarker(elem, {
      ...option, 
      orientation: SizeMarker.Orientation.Horizontal,
    });
  }

  static addHorizontalMarker_MarginBoundary(elem, option = {}) {
    SizeMarker.addMarker(elem, {
      ...option, 
      orientation: SizeMarker.Orientation.Horizontal,
      boundaryLeft: SizeMarker.Boundary.Margin,
      boundaryRight: SizeMarker.Boundary.Margin,
    });
  }

  static addHorizontalMarker_BorderBoundary(elem, option = {}) {
    SizeMarker.addMarker(elem, {
      ...option, 
      orientation: SizeMarker.Orientation.Horizontal,
      boundaryLeft: SizeMarker.Boundary.Border,
      boundaryRight: SizeMarker.Boundary.Border,
    });
  }

  static addHorizontalMarker_PaddingBoundary(elem, option = {}) {
    SizeMarker.addMarker(elem, {
      ...option, 
      orientation: SizeMarker.Orientation.Horizontal,
      boundaryLeft: SizeMarker.Boundary.Padding,
      boundaryRight: SizeMarker.Boundary.Padding,
    });
  }


  /**
   * @param {HTMLElement} elem 
   * @param {Option} option
   */
  static addVerticalMarker(elem, option = {}) {
    SizeMarker.addMarker(elem, {
      ...option,
      orientation: SizeMarker.Orientation.Vertical,
    });
  }

  static addVerticalMarker_MarginBoundary(elem, option = {}) {
    SizeMarker.addMarker(elem, {
      ...option, 
      orientation: SizeMarker.Orientation.Vertical,
      boundaryTop: SizeMarker.Boundary.Margin,
      boundaryBottom: SizeMarker.Boundary.Margin,
    });
  }

  static addVerticalMarker_BorderBoundary(elem, option = {}) {
    SizeMarker.addMarker(elem, {
      ...option, 
      orientation: SizeMarker.Orientation.Vertical,
      boundaryTop: SizeMarker.Boundary.Border,
      boundaryBottom: SizeMarker.Boundary.Border,
    });
  }

  static addVerticalMarker_PaddingBoundary(elem, option = {}) {
    SizeMarker.addMarker(elem, {
      ...option, 
      orientation: SizeMarker.Orientation.Vertical,
      boundaryTop: SizeMarker.Boundary.Padding,
      boundaryBottom: SizeMarker.Boundary.Padding,
    });
  }
}