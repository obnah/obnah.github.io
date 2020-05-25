var app = angular.module("canvas", []);

app.directive("drawing", function(){
	return {
		restrict: "A",
	link: function(scope, element){
		var ctx = element[0].getContext('2d');
	  	var canvas = element[0];
		canvas.width = canvas.clientWidth;
		canvas.height = canvas.clientHeight;

		// variable that decides if something should be drawn on mousemove
		var drawing = false;

		// the last coordinates before the current move
		var centerX;
		var centerY;

		element.bind('mousedown', function(event){
			centerX = event.offsetX;
			centerY = event.offsetY;
			// begins new line
			ctx.beginPath();
			drawing = true;
		});

		element.bind('mousemove', function(event){
			ctx.clearRect(0,0,canvas.width,17);
			ctx.font = '10pt Calibri';
			ctx.fillStyle = 'white';
			ctx.fillText("Canvas: " + canvas.clientWidth + "x" + canvas.clientHeight + "@" + canvas.offsetLeft + "," + canvas.offsetTop + "   Mouse: " + event.offsetX + "," + event.offsetY, 2, 12);

			if(drawing){
				// get current mouse position
				currentX = event.offsetX;
				currentY = event.offsetY;
				//draw(centerX, centerY, currentX, currentY);
			}
		});

		element.bind('mouseup', function(event){
			draw(centerX, centerY, currentX, currentY);
			// stop drawing
			drawing = false;
		});

		// canvas reset
		function reset(){
			element[0].width = element[0].width; 
		}

		function draw(startX, startY, currentX, currentY){
			//reset();
			var sizeX = currentX - startX;
			var sizeY = currentY - startY;

			ctx.rect(startX, startY, sizeX, sizeY);
			ctx.lineWidth = 3;
			// color
			ctx.strokeStyle = '#fff';
			// draw it
			ctx.stroke();
		}
	}
	};
});

