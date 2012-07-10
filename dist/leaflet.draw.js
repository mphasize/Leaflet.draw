(function(){L.Handler.Draw=L.Handler.extend({includes:L.Mixin.Events,initialize:function(e,t){this._map=e,this._container=e._container,this._pane=e._panes.overlayPane,this.options.shapeOptions=L.Util.extend({},this.options.shapeOptions,t)},enable:function(){this.fire("activated"),L.Handler.prototype.enable.call(this)},addHooks:function(){this._map&&(L.DomUtil.disableTextSelection(),this._label=L.DomUtil.create("div","leaflet-draw-label",this._pane),this._singleLineLabel=!1,L.DomEvent.addListener(window,"keyup",this._cancelDrawing,this))},removeHooks:function(){this._map&&(L.DomUtil.enableTextSelection(),this._pane.removeChild(this._label),delete this._label,L.DomEvent.removeListener(window,"keyup",this._cancelDrawing))},_updateLabelText:function(e){e.subtext=e.subtext||"",e.subtext.length===0&&!this._singleLineLabel?(L.DomUtil.addClass(this._label,"leaflet-draw-label-single"),this._singleLineLabel=!0):e.subtext.length>0&&this._singleLineLabel&&(L.DomUtil.removeClass(this._label,"leaflet-draw-label-single"),this._singleLineLabel=!1),this._label.innerHTML=(e.subtext.length>0?'<span class="leaflet-draw-label-subtext">'+e.subtext+"</span>"+"<br />":"")+"<span>"+e.text+"</span>"},_updateLabelPosition:function(e){L.DomUtil.setPosition(this._label,e)},_cancelDrawing:function(e){e.keyCode===27&&this.disable()}}),L.Polyline.Draw=L.Handler.Draw.extend({Poly:L.Polyline,options:{icon:new L.DivIcon({iconSize:new L.Point(20,20),className:"leaflet-div-icon leaflet-editing-icon"}),guidelineDistance:20,shapeOptions:{stroke:!0,color:"#f06eaa",weight:4,opacity:.5,fill:!1,clickable:!0}},addHooks:function(){L.Handler.Draw.prototype.addHooks.call(this),this._map&&(this._markers=[],this._markerGroup=new L.LayerGroup,this._map.addLayer(this._markerGroup),this._poly=new L.Polyline([],this.options.shapeOptions),this._container.style.cursor="crosshair",this._updateLabelText(this._getLabelText()),L.DomEvent.addListener(this._container,"mousemove",this._onMouseMove,this).addListener(this._container,"click",this._onClick,this),L.Browser.touch&&L.DomEvent.addListener(this._container,"touchmove",this._onMouseMove,this).addListener(this._container,"touchend",this._onClick,this))},removeHooks:function(){L.Handler.Draw.prototype.removeHooks.call(this),this._cleanUpShape(),this._map.removeLayer(this._markerGroup),delete this._markerGroup,delete this._markers,this._map.removeLayer(this._poly),delete this._poly,this._clearGuides(),this._container.style.cursor="",L.DomEvent.removeListener(this._container,"mousemove",this._onMouseMove).removeListener(this._container,"click",this._onClick),L.Browser.touch&&L.DomEvent.removeListener(this._container,"touchmove",this._onMouseMove).removeListener(this._container,"touchend",this._onClick)},_finishShape:function(){this._map.fire("draw:poly-created",{poly:new this.Poly(this._poly.getLatLngs(),this.options.shapeOptions)}),this.disable()},_onMouseMove:function(e){var t=this._map.mouseEventToLayerPoint(e.touches?e.touches[0]:e),n=this._map.mouseEventToLatLng(e.touches?e.touches[0]:e),r=this._markers.length;e.touches&&L.DomEvent.stopPropagation(e),this._updateLabelPosition(t),r>0&&(this._updateLabelText(this._getLabelText(n)),this._clearGuides(),this._drawGuide(this._map.latLngToLayerPoint(this._markers[r-1].getLatLng()),t)),L.DomEvent.preventDefault(e)},_onClick:function(e){var t=this._map.mouseEventToLatLng(e.touches?e.touches[0]:e);this._markers.push(this._createMarker(t)),this._poly.addLatLng(t),this._poly.getLatLngs().length===2&&this._map.addLayer(this._poly),this._updateMarkerHandler(),this._vertexAdded(t)},_updateMarkerHandler:function(){this._markers.length>1&&(this._markers[this._markers.length-1].on("click",this._finishShape,this),L.Browser.touch&&this._markers[this._markers.length-1].on("touchend",this._finishShape,this)),this._markers.length>2&&(this._markers[this._markers.length-2].off("click",this._finishShape),L.Browser.touch&&this._markers[this._markers.length-2].off("touchend",this._finishShape))},_createMarker:function(e){var t=new L.Marker(e,{icon:this.options.icon});return this._markerGroup.addLayer(t),t},_drawGuide:function(e,t){var n=Math.floor(Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2))),r,i,s,o;this._guidesContainer||(this._guidesContainer=L.DomUtil.create("div","leaflet-draw-guides",this._pane));for(r=this.options.guidelineDistance;r<n;r+=this.options.guidelineDistance)i=r/n,s={x:Math.floor(e.x*(1-i)+i*t.x),y:Math.floor(e.y*(1-i)+i*t.y)},o=L.DomUtil.create("div","leaflet-draw-guide-dash",this._guidesContainer),o.style.backgroundColor=this.options.shapeOptions.color,L.DomUtil.setPosition(o,s)},_getLabelText:function(e){var t,n,r;return this._markers.length===0?t={text:(L.Browser.touch?"Tap":"Click")+" to start drawing line."}:(n=this._measurementRunningTotal+e.distanceTo(this._markers[this._markers.length-1].getLatLng()),r=n>1e3?(n/1e3).toFixed(2)+" km":Math.ceil(n)+" m",this._markers.length===1?t={text:(L.Browser.touch?"Tap":"Click")+" to continue drawing line.",subtext:r}:t={text:(L.Browser.touch?"Tap":"Click")+" last point to finish line.",subtext:r}),t},_vertexAdded:function(e){this._markers.length===1?this._measurementRunningTotal=0:this._measurementRunningTotal+=e.distanceTo(this._markers[this._markers.length-2].getLatLng())},_cleanUpShape:function(){this._markers.length>0&&(this._markers[this._markers.length-1].off("click",this._finishShape),L.Browser.touch&&this._markers[this._markers.length-1].off("touchend",this._finishShape))},_clearGuides:function(){if(this._guidesContainer)while(this._guidesContainer.firstChild)this._guidesContainer.removeChild(this._guidesContainer.firstChild)}}),L.Polygon.Draw=L.Polyline.Draw.extend({Poly:L.Polygon,options:{shapeOptions:{stroke:!0,color:"#f06eaa",weight:4,opacity:.5,fill:!0,fillColor:null,fillOpacity:.2,clickable:!0}},_updateMarkerHandler:function(){this._markers.length===1&&(this._markers[0].on("click",this._finishShape,this),L.Browser.touch&&this._markers[0].on("touchend",this._finishShape,this))},_getLabelText:function(){var e;return this._markers.length===0?e=(L.Browser.touch?"Tap":"Click")+" to start drawing shape.":this._markers.length<3?e=(L.Browser.touch?"Tap":"Click")+" to continue drawing shape.":e=(L.Browser.touch?"Tap":"Click")+" first point to close this shape.",{text:e}},_vertexAdded:function(e){},_cleanUpShape:function(){this._markers.length>0&&(this._markers[0].off("click",this._finishShape),L.Browser.touch&&this._markers[0].off("touchend",this._finishShape))}}),L.SimpleShape={},L.SimpleShape.Draw=L.Handler.Draw.extend({addHooks:function(){L.Handler.Draw.prototype.addHooks.call(this),this._map&&(this._map.dragging.disable(),this._container.style.cursor="crosshair",this._updateLabelText({text:this._initialLabelText}),L.DomEvent.addListener(this._container,"mousedown",this._onMouseDown,this).addListener(document,"mousemove",this._onMouseMove,this),L.Browser.touch&&L.DomEvent.addListener(this._container,"touchstart",this._onMouseDown,this).addListener(document,"touchmove",this._onMouseMove,this))},removeHooks:function(){L.Handler.Draw.prototype.removeHooks.call(this),this._map&&(this._map.dragging.enable(),this._container.style.cursor="",L.DomEvent.removeListener(this._container,"mousedown",this._onMouseDown).removeListener(document,"mousemove",this._onMouseMove).removeListener(document,"mouseup",this._onMouseUp),L.Browser.touch&&L.DomEvent.removeListener(this._container,"touchstart",this._onMouseDown).removeListener(document,"touchmove",this._onMouseMove).removeListener(document,"touchend",this._onMouseUp),this._shape&&(this._map.removeLayer(this._shape),delete this._shape)),this._isDrawing=!1},_onMouseDown:function(e){this._isDrawing=!0,this._updateLabelText({text:"Release "+(L.Browser.touch?"finger":"mouse")+" to finish drawing."}),this._startLatLng=this._map.mouseEventToLatLng(e.touches?e.touches[0]:e),e.touches&&L.DomEvent.stopPropagation(e),L.DomEvent.addListener(document,"mouseup",this._onMouseUp,this).preventDefault(e),L.Browser.touch&&L.DomEvent.addListener(document,"touchend",this._onMouseUp,this)},_onMouseMove:function(e){var t=this._map.mouseEventToLayerPoint(e.touches?e.touches[0]:e),n=this._map.mouseEventToLatLng(e.touches?e.touches[0]:e);e.touches&&L.DomEvent.stopPropagation(e),this._updateLabelPosition(t),this._isDrawing&&(this._updateLabelPosition(t),this._drawShape(n))},_onMouseUp:function(e){this._endLatLng=this._map.mouseEventToLatLng(e.touches?e.touches[0]:e),e.touches&&L.DomEvent.stopPropagation(e),this._fireCreatedEvent(),this.disable()}}),L.Circle.Draw=L.SimpleShape.Draw.extend({options:{shapeOptions:{stroke:!0,color:"#f06eaa",weight:4,opacity:.5,fill:!0,fillColor:null,fillOpacity:.2,clickable:!0}},_initialLabelText:(L.Browser.touch?"Tap":"Click")+" and drag to draw circle.",_drawShape:function(e){this._shape?this._shape.setRadius(this._startLatLng.distanceTo(e)):(this._shape=new L.Circle(this._startLatLng,this._startLatLng.distanceTo(e),this.options.shapeOptions),this._map.addLayer(this._shape))},_fireCreatedEvent:function(){this._map.fire("draw:circle-created",{circ:new L.Circle(this._startLatLng,this._startLatLng.distanceTo(this._endLatLng),this.options.shapeOptions)})}}),L.Rectangle.Draw=L.SimpleShape.Draw.extend({options:{shapeOptions:{stroke:!0,color:"#f06eaa",weight:4,opacity:.5,fill:!0,fillColor:null,fillOpacity:.2,clickable:!0}},_initialLabelText:(L.Browser.touch?"Tap":"Click")+" and drag to draw rectangle.",_drawShape:function(e){this._shape?this._shape.setBounds(new L.LatLngBounds(this._startLatLng,e)):(this._shape=new L.Rectangle(new L.LatLngBounds(this._startLatLng,e),this.options.shapeOptions),this._map.addLayer(this._shape))},_fireCreatedEvent:function(){this._map.fire("draw:rectangle-created",{rect:new L.Rectangle(new L.LatLngBounds(this._startLatLng,this._endLatLng),this.options.shapeOptions)})}}),L.Marker.Draw=L.Handler.Draw.extend({options:{icon:new L.Icon.Default},addHooks:function(){L.Handler.Draw.prototype.addHooks.call(this),this._map&&(this._updateLabelText({text:(L.Browser.touch?"Tap":"Click")+" map to place marker."}),L.DomEvent.addListener(this._container,"mousemove",this._onMouseMove,this),L.Browser.touch&&(L.DomEvent.addListener(this._container,"touchmove",this._onMouseMove,this),L.DomEvent.addListener(this._container,"touchend",this._onClick,this)))},removeHooks:function(){console.log("removing hooks"),L.Handler.Draw.prototype.removeHooks.call(this),this._map&&(this._marker&&(L.DomEvent.removeListener(this._marker,"click",this._onClick).removeListener(this._map,"click",this._onClick),L.Browser.touch&&L.DomEvent.removeListener(this._marker,"touchend",this._onClick),this._map.removeLayer(this._marker),delete this._marker),L.DomEvent.removeListener(this._container,"mousemove",this._onMouseMove),L.Browser.touch&&L.DomEvent.removeListener(this._container,"touchmove",this._onMouseMove).removeListener(this._container,"touchend",this._onClick))},_onMouseMove:function(e){var t=this._map.mouseEventToLayerPoint(e.touches?e.touches[0]:e),n=this._map.mouseEventToLatLng(e.touches?e.touches[0]:e);e.touches&&L.DomEvent.stopPropagation(e),this._updateLabelPosition(t),this._marker?this._marker.setLatLng(n):(this._marker=new L.Marker(n,this.options.icon),this._map.addLayer(this._marker),L.DomEvent.addListener(this._marker,"click",this._onClick,this).addListener(this._map,"click",this._onClick,this),L.Browser.touch&&L.DomEvent.addListener(this._marker,"touchend",this._onClick,this))},_onClick:function(e){console.log("Tapped"+(this._map?"map":"somewhere")),e.touches&&L.DomEvent.stopPropagation(e);var t=null;this._marker&&(console.log("creating latlng from marker"),t=this._marker.getLatLng()),console.log("creating latlng from touch "+e.touches.length),t=this._map.mouseEventToLatLng(e.changedTouches?e.changedTouches[0]:e),console.log("firing now"),this._map.fire("draw:marker-created",{marker:new L.Marker(t,this.options.icon)}),console.log("fired event"),this.disable()}}),L.Map.mergeOptions({drawControl:!1}),L.Control.Draw=L.Control.extend({options:{position:"topleft",drawPolyline:!0,drawPolygon:!0,drawRectangle:!0,drawCircle:!0,drawMarker:!0,styles:{}},handlers:{},onAdd:function(e){var t="leaflet-control-draw",n=L.DomUtil.create("div",t);return this.options.drawPolyline&&(this.handlers.polyline=new L.Polyline.Draw(e,this.options.styles.polyline),this._createButton("Draw a polyline",t+"-polyline",n,this.handlers.polyline.enable,this.handlers.polyline),this.handlers.polyline.on("activated",this._disableInactiveModes,this)),this.options.drawPolygon&&(this.handlers.polygon=new L.Polygon.Draw(e,this.options.styles.polygon),this._createButton("Draw a polygon",t+"-polygon",n,this.handlers.polygon.enable,this.handlers.polygon),this.handlers.polygon.on("activated",this._disableInactiveModes,this)),this.options.drawRectangle&&(this.handlers.rectangle=new L.Rectangle.Draw(e,this.options.styles.rectangle),this._createButton("Draw a rectangle",t+"-rectangle",n,this.handlers.rectangle.enable,this.handlers.rectangle),this.handlers.rectangle.on("activated",this._disableInactiveModes,this)),this.options.drawCircle&&(this.handlers.circle=new L.Circle.Draw(e,this.options.styles.circle),this._createButton("Draw a circle",t+"-circle",n,this.handlers.circle.enable,this.handlers.circle),this.handlers.circle.on("activated",this._disableInactiveModes,this)),this.options.drawMarker&&(this.handlers.marker=new L.Marker.Draw(e),this._createButton("Add a marker",t+"-marker",n,this.handlers.marker.enable,this.handlers.marker),this.handlers.marker.on("activated",this._disableInactiveModes,this)),n},_createButton:function(e,t,n,r,i){var s=L.DomUtil.create("a",t,n);return s.href="#",s.title=e,L.DomEvent.addListener(s,"click",L.DomEvent.stopPropagation).addListener(s,"click",L.DomEvent.preventDefault).addListener(s,"click",r,i),s},_disableInactiveModes:function(){for(var e in this.handlers)this.handlers.hasOwnProperty(e)&&this.handlers[e].enabled&&this.handlers[e].disable()}}),L.Map.addInitHook(function(){this.options.drawControl&&(this.drawControl=new L.Control.Draw,this.addControl(this.drawControl))})})();