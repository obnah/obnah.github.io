
var diagMap = {};
var defaultLinkFont = "bold 10px helvetica, bold arial, sans-serif";
var highlightLinkFont = "bold 14px helvetica, bold, arial, sans-serif";

function fsmDiagInit(name) {
	var $ = go.GraphObject.make;
	diagram = $(go.Diagram, name+"Div", {
		initialContentAlignment: go.Spot.Center,
		"draggingTool.isGridSnapEnabled": true,
		"toolManager.mouseWheelBehavior": go.ToolManager.WheelNone,
		"undoManager.isEnabled": true
		});
	diagram.labelVisible = false;
    diagram.nodeTemplate = $(go.Node, "Auto", 
		new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
		$(go.Shape, "RoundedRectangle", {
			fill: "transparent"
			}),
		$(go.TextBlock, {}, new go.Binding("text").makeTwoWay())
		);
	diagram.linkTemplate = $(go.Link, {
		adjusting: go.Link.Stretch,
		reshapable: true,
		relinkableFrom: true,
		relinkableTo: true,
		toShortLength: 3,
		selectionChanged: function (link) {
			var it = link.elements.iterator;
			var diag = link.diagram;
			it.first();
			it.next();
			it.next();
			it.value.visible = link.isSelected;
			if (link.isSelected) {
				it.value.font = highlightLinkFont;
				it.value.oldStroke = it.value.stroke;
				it.value.stroke = "darkblue";
				it.value.visible = true;
			} else {
				it.value.font = defaultLinkFont;
				it.value.stroke = it.value.oldStroke;
				it.value.visible = diagram.labelVisible;
			}
			}
		},
		new go.Binding("curviness"),
		$(go.Shape, { strokeWidth: 1.5 }),
		$(go.Shape, { toArrow: "standard", stroke: null }),
		$(go.TextBlock, "transition", {
			visible: false,
			textAlign: "center",
			font: defaultLinkFont
			},
			new go.Binding("text").makeTwoWay())
		);
	diagram.model = go.Model.fromJson(document.getElementById(name+"Model").value);
	diagMap[name] = diagram;
}

function showModel(name) {
	var diagram = diagMap[name];
	var win = window.open("about:blank",
			null,
			"width=400,height=300");
	var doc = win.document;
	doc.open("text/html");
	doc.write(diagram.model.toJson());
	doc.close(); 
}                

function switchLinkLabels(name) {
	var diagram = diagMap[name];
	diagram.startTransaction("swapLinkLabels");
	diagram.labelVisible = !diagram.labelVisible;
    diagram.links.each(function (link) {
		var it = link.elements.iterator;
		it.first();
		it.next();
		it.next();
		it.value.visible = link.isSelected ? true : diagram.labelVisible;
	});
	diagram.commitTransaction();
}

//-----------------------------------------------------------------------------
function spotConverter(dir, from) {
	if (dir == "left") {
		return (from ? go.Spot.Left : go.Spot.Right);
	} else {
		return (from ? go.Spot.Right : go.Spot.Left);
	}
}

function mmDiagInit(name) {
 	var $ = go.GraphObject.make;
	diagram = $(go.Diagram, name+"Div", {
			initialContentAlignment: go.Spot.Center,
			"draggingTool.dragsTree": true,
			"toolManager.mouseWheelBehavior": go.ToolManager.WheelNone,
			"undoManager.isEnabled": true,
			"commandHandler.copiesTree": true,
			"commandHandler.deletesTree": true
		});
	diagram.nodeTemplate = $(go.Node, "Vertical", 
			{ selectionObjectName: "TEXT" },
			$(go.TextBlock, {
				name: "TEXT",
				minSize: new go.Size(30, 15),
				editable: true
			},
			new go.Binding("text", "text").makeTwoWay(),
			new go.Binding("scale", "scale").makeTwoWay(),
			new go.Binding("font", "font").makeTwoWay()
			),
			$(go.Shape, "LineH", {
				stretch: go.GraphObject.Horizontal,
				strokeWidth: 3,
				height: 3,
				portId: "",
				fromSpot: go.Spot.LeftRightSides,
				toSpot: go.Spot.LeftRightSides
			},
			new go.Binding("stroke", "brush"),
			new go.Binding("fromSpot", "dir", function(d) { return spotConverter(d, true); }),
			new go.Binding("toSpot", "dir", function(d) { return spotConvert(d, false); })
			),
			new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
			new go.Binding("locationSpot", "dir", function(d) { return spotConverter(d, false); })
		);
	diagram.linkTemplate = $(go.Link, {
		curve: go.Link.Bezier,
		fromShortLength: -2,
		toShortLength: -2,
		selectable: false
		},
		$(go.Shape,{strokeWidth: 3 },
			new go.Binding("stroke", "toNode", function(n) { return n.data.brush ? n.data.brush : "black"; }).ofObject()
	    )
		);
	diagram.model = go.Model.fromJson(document.getElementById(name+"Model").value);
	diagMap[name] = diagram;    
}

function baseDiagInit(name) {
	var $ = go.GraphObject.make;
	diagram = $(go.Diagram, name+"Div", {
		initialContentAlignment: go.Spot.Center,
		"toolManager.mouseWheelBehavior": go.ToolManager.WheelNone,
		"undoManager.isEnabled": true
		});
    diagram.nodeTemplate = $(go.Node, "Auto", 
		new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
		$(go.Shape, "RoundedRectangle", {
			fill: "transparent"
			}),
		$(go.TextBlock, {}, new go.Binding("text").makeTwoWay())
		);
	diagram.model = go.Model.fromJson(document.getElementById(name+"Model").value);
	diagMap[name] = diagram;
} 

