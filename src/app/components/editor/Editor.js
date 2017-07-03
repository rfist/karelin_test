class EditorController {
  constructor($window, $scope, $http) {
    this.$http = $http;
    this.$scope = $scope;
    this.text = 'My brand new component!';
    this.canvas = new fabric.Canvas('c');
    this.fillColor = '#000000';
    this.strokeColor = '#000000';
    this.type = 'object';
    this.isDrawLine = false;
    this.isMouseDown = false;
    this.testNumber = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.addMouseListeners();
    $window.onkeydown = this.checkKey.bind(this);
    this.history = [];
  }
  checkKey(e) {
    const multiplier = e.shiftKey ? 10 : 1;
    if (this.activeObject) {
      if (e.keyCode === 38) {
        if (e.ctrlKey) {
          this.activeObject.height -= 5;
          this.refresh();
        } else {
          this.activeObject.top -= multiplier;
        }
        // up arrow
      } else if (e.keyCode === 40) {
        if (e.ctrlKey) {
          this.activeObject.height += 5;
          this.refresh();
        } else {
          this.activeObject.top += multiplier;
        }
        // down arrow
      } else if (e.keyCode === 37) {
        // left arrow
        if (e.ctrlKey) {
          const curAngle = this.activeObject.getAngle();
          this.activeObject.setAngle(curAngle + 15);
          this.refresh();
        } else {
          this.activeObject.left -= multiplier;
        }
      } else if (e.keyCode === 39) {
        // right arrow
        if (e.ctrlKey) {
          const curAngle = this.activeObject.getAngle();
          this.activeObject.setAngle(curAngle - 15);
          this.refresh();
        } else {
          this.activeObject.left += multiplier;
        }
      } else if (e.keyCode === 46) {
        this.activeObject.remove();
      } else if (e.keyCode === 83) {
        this.activeObject.selectable = false;
      } else if (e.code === 'KeyD' && e.ctrlKey) {
        e.preventDefault();
        this.duplicateObj();
      } else if (e.code === 'Tab') {
        e.preventDefault();
        this.selectObject(e.shiftKey);
      }
      this.refresh();
    }
    if (e.code === 'KeyZ' && e.ctrlKey) {
      console.log('Undo');
      this.stepBackInHistory();
    }
    if (e.code === 'Space') {
      this.drawLine();
    }
    if (e.code === 'KeyQ') {
      this.canvas.getObjects().forEach(obj => {
        obj.selectable = false;
      });
      this.refresh();
      console.log('all locked');
    }
    if (e.code === 'KeyR') {
      // this.addRectangle();
      if (this.activeGroup) {
        const activeObject = this.canvas.getActiveObject();
        console.log('active object', activeObject);
        if (activeObject.type === 'group') {
          const items = activeObject._objects;
          activeObject._restoreObjectsState();
          this.canvas.remove(activeObject);
          for (let i = 0; i < items.length; i++) {
            this.canvas.add(items[i]);
            // this.canvas.item(this.canvas.size()-1).hasControls = true;
          }
          this.canvas.renderAll();
        }
      }
    }
  }
  selectObject(isPrev) {
    if (this.activeObject) {
      let currentItemIndex = this.canvas.getObjects().indexOf(this.activeObject);
      currentItemIndex = isPrev ? currentItemIndex - 1 : currentItemIndex + 1;
      if (currentItemIndex < 0) {
        currentItemIndex = this.canvas.getObjects().length - 1;
      }
      if (currentItemIndex > this.canvas.getObjects().length - 1) {
        currentItemIndex = 0;
      }
      this.canvas.setActiveObject(this.canvas.getObjects()[currentItemIndex]);
    } else {
      this.canvas.setActiveObject(this.canvas.getObjects()[0]);
    }
  }
  onMouseDown(o) {
    if (this.activeObject) {
      this.type = this.activeObject.role;
      this.$scope.$digest();
      this.addToHistory();
      console.log('this.activeObject', this.activeObject);
    }
    if (!this.isDrawLine) {
      return;
    }
    this.isMouseDown = true;
    const pointer = this.canvas.getPointer(o.e);
    const points = [pointer.x, pointer.y, pointer.x, pointer.y];
    this.line = new fabric.Line(points, {
      strokeWidth: 5,
      fill: 'black',
      stroke: 'black',
      originX: 'center',
      originY: 'center'
    });
    this.canvas.add(this.line);
  }
  onMouseMove(o) {
    if (!this.isMouseDown) {
      return;
    }
    const pointer = this.canvas.getPointer(o.e);
    this.line.set({x2: pointer.x, y2: pointer.y});
    this.isDrawLine = false;
    this.refresh();
  }
  onMouseUp() {
    this.isMouseDown = false;
    this.$scope.$digest();
  }
  addMouseListeners() {
    this.canvas.on('mouse:down', this.onMouseDown.bind(this));
    this.canvas.on('mouse:move', this.onMouseMove.bind(this));
    this.canvas.on('mouse:up', this.onMouseUp.bind(this));
  }
  drawLine() {
    this.addToHistory();
    this.isDrawLine = true;
    this.$scope.$digest();
  }
  addRectangle() {
    this.addToHistory();
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: this.fillColor,
      width: 5,
      height: 100,
      role: this.type
    });
    rect.stateProperties.push('role');
    this.canvas.add(rect);
    this.canvas.setActiveObject(rect);
    console.log('add rectangle', rect);
    return rect;
  }

  get activeObject() {
    return this.canvas.getActiveObject();
  }

  get activeGroup() {
    if (this.canvas.getActiveGroup()) {
      return this.canvas.getActiveGroup()._objects;
    }
    return null;
  }

  onTypeChange() {
    this.addToHistory();
    console.log(this.type);
    if (this.activeObject) {
      this.activeObject.role = this.type;
    }
  }
  duplicateObj() {
    if (this.activeObject) {
      this.addToHistory();
      this.activeObject.clone(this.cloneFunction.bind(this));
    }
  }
  cloneFunction(o) {
    const vobj = o;
    if (vobj) {
      vobj.set({
        left: this.activeObject.left,
        top: this.activeObject.top
      });
      this.canvas.add(vobj);
      this.refresh();
    }
  }
  onFillColorChange() {
    if (this.activeObject) {
      this.activeObject.setColor(this.fillColor);
      console.log(this.fillColor);
      this.addToHistory();
      this.refresh();
    }
  }
  onStrokeColorChange() {
    if (this.activeObject) {
      this.activeObject.setStroke(this.strokeColor);
      this.addToHistory();
      this.refresh();
    }
  }
  refresh() {
    this.canvas.renderAll();
  }
  saveTest() {
    console.log('save scene', angular.toJson(this.canvas.toJSON(['id'])));
    const file = new File([angular.toJson(this.canvas.toJSON(['id']))], 'scene.json', {type: 'text/plain;charset=utf-8'});
    saveAs(file, 'test' + this.testNumber + '.json');
  }
  applyOffset() {
    this.canvas.getObjects().forEach(obj => {
      obj.top = obj.originTop + this.offsetY;
      obj.left = obj.originLeft + this.offsetX;
      console.log('offsets', obj.originLeft, obj.left, this.offsetX);
    });
    this.refresh();
  }
  loadTest() {
    fabric.loadSVGFromURL('svg/' + this.testNumber + '.svg', (objects, options) => {
      this.loadSVG(objects, options);
    });
  }
  loadSVG(objects) {
    objects.forEach(obj => {
      obj.selected = false;
      const angle = Math.asin(obj.transformMatrix[1]) * 180 / Math.PI;
      obj.transformMatrix = [1, 0, 0, 1, 0, 0];
      obj.transformMatrix[4] = 0;
      obj.transformMatrix[5] = 0;
      if (obj.id === 'background') {
        obj.selectable = false;
      }
      obj.originTop = obj.top;
      obj.originLeft = obj.left;
      switch (parseInt(this.testNumber, 10)) {
        case 1:
          obj.top -= 475;
          obj.left -= 170;
          break;
        case 2:
          obj.top -= 465;
          obj.left -= 190;
          break;
        case 3:
          obj.top -= 500;
          obj.left -= 190;
          break;
        case 4:
          obj.top -= 450;
          obj.left -= 10;
          break;
        case 5:
          obj.top -= 460;
          obj.left -= 190;
          break;
        case 6:
          obj.top -= 570;
          obj.left -= 160;
          break;
        case 7:
          obj.top -= 460;
          obj.left -= 90;
          break;
        case 8:
          obj.top -= 470;
          obj.left -= 200;
          break;
        case 9:
          obj.top -= 530;
          obj.left -= 250;
          break;
        case 10:
          obj.top -= 430;
          obj.left -= 150;
          break;
        case 11:
          obj.top -= 335;
          obj.left -= 170;
          break;
        case 12:
          obj.top -= 450;
          obj.left -= 160;
          break;
        case 13:
          obj.top -= 490;
          obj.left -= 180;
          break;
        case 14:
          obj.top -= 430;
          obj.left -= 60;
          break;
        case 15:
          obj.top -= 430;
          obj.left -= 150;
          break;
        case 16:
          obj.top -= 470;
          obj.left -= 150;
          break;
        case 17:
          obj.top -= 280;
          obj.left -= 90;
          break;
        case 18:
          obj.top -= 470;
          obj.left -= 180;
          break;
        case 19:
          obj.top -= 470;
          obj.left -= 180;
          break;
        case 20:
          obj.top -= 470;
          obj.left -= 200;
          break;
        case 21:
          obj.top -= 490;
          obj.left -= 240;
          break;
        case 22:
          obj.top -= 470;
          obj.left -= 150;
          break;
        case 23:
          obj.top -= 430;
          obj.left -= 250;
          break;
        case 24:
          obj.top -= 450;
          obj.left -= 200;
          break;
        default:
          break;
      }
      this.canvas.add(obj);
      obj.setAngle(angle);
    });
    this.refresh();
  }
  addToHistory() {
    this.history.push(this.canvas.toJSON(['role']));
  }
  stepBackInHistory() {
    const lastStep = this.history[this.history.length - 1];
    this.history.splice(-1, 1);
    this.canvas.loadFromJSON(lastStep, () => {
      this.refresh();
      console.log('well done');
    });
  }
}
// http://localhost:3000/#!/editor

export const editor = {
  template: require('./Editor.html'),
  controller: EditorController
};

