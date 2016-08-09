(function(){
	var lines =[];
	lines.push("A pong implementation using Angular + D3")
	lines.push("┌─┐┬ ┬┌┐┌┌─┐┌┬┐┬┌─┐┌┐┌┌─┐┬   ┌─┐┌─┐┌─┐┌┬┐┬ ┬┌─┐┌┬┐┬┌─┐┌─┐");
	lines.push("├┤ │ │││││   │ ││ ││││├─┤│───├─┤├┤ └─┐ │ ├─┤├┤  │ ││  └─┐");
	lines.push("└  └─┘┘└┘└─┘ ┴ ┴└─┘┘└┘┴ ┴┴─┘ ┴ ┴└─┘└─┘ ┴ ┴ ┴└─┘ ┴ ┴└─┘└─┘");
	lines.push("http://functional-aesthetics.rhcloud.com ");
	lines.forEach( function( element, index) {
		console.log(element);
	});
})()

var app = angular.module('angularPong', []);

app
.directive ("gameContainer", function() {
	return {
		restrict:'A',
		scope: false,
		controller: ['$scope','$element','$timeout','$interval',function($scope,$element,$timeout,$interval) {

			$scope.gameLoop;
			$scope.playing = false;
			$scope.fps = 50;
			//input control bools
			$scope.p1up = false;
			$scope.p1down = false;
			$scope.p2up = false;
			$scope.p2down = false;

			//PONG CLASS PROTOTYPES  how to load in seperate file?
			function BallObject() {

					}
			BallObject.prototype = {
				r:15,
				x:parseInt($scope.width/2),
				y:parseInt($scope.height/2),
				vx:5,//function() {return 10*Math.random()*(2*Math.round(Math.random())-1)},//10*Math.random()*(2*Math.round(Math.random())-1) -1 or 1
				vy:5,//function() {return 10*Math.random()*(2*Math.round(Math.random())-1)},//*(Math.ceil(2*Math.random())-1),
				reset: function() {
					this.x = $scope.width/2;
					this.y = $scope.height/2;
							//#1-10                    -1 or 1                   FPS calibration
					this.vx =(9*Math.random()+1)*(2*Math.round(Math.random())-1)*(40/$scope.fps);
					this.vy =(9*Math.random()+1)*(2*Math.round(Math.random())-1)*(40/$scope.fps);
					},
				move: function() {
					if(this.x < $scope.width && this.x >0 ) {
						//ball in bounds!
						this.x += this.vx;
					}
					else {
						//ball hitting left or right wall
						(this.x >= $scope.width )? ($scope.myPaddleOne.score++,this.reset()) : ($scope.myPaddleTwo.score++,this.reset());						
					}
					//hitting top/bottom walls
					(this.y<$scope.height && this.y >0) ? this.y +=this.vy : (this.vy *=-1,this.y +=this.vy);
					
					//check for possible collision left!
					if( (this.x -this.r> $scope.buffer && this.x-this.r < ($scope.buffer+$scope.myPaddleOne.s_width) ) ) {
						//how to catch when ball hits edge?
						if ( (   this.y+this.r < ($scope.myPaddleOne.posy + $scope.myPaddleOne.height/2 ) ) && (this.y-this.r > ($scope.myPaddleOne.posy - $scope.myPaddleOne.height/2) ) ) {this.vx*=-1.3; console.log("left");}
						}//possible collision right
					else if (this.x +this.r< $scope.width-$scope.buffer && this.x+this.r > ($scope.width-($scope.buffer+$scope.myPaddleTwo.s_width))  ) {
						if (    this.y +this.r<  ($scope.myPaddleTwo.posy + $scope.myPaddleTwo.height/2 ) && (this.y-this.r > ($scope.myPaddleTwo.posy - $scope.myPaddleTwo.height/2))) {this.vx*=-1.3; console.log("right");}
					}
				}
			}
			function PaddleObject(name) {
						this.name = name;
					}
					PaddleObject.prototype = {
						name: "",
						s_width: 16,
						height: 150,
						posy:300,
						score:0,
						moveup: function(amount) {
							if((this.posy-this.height/2) > 8) {
								this.posy-=amount;
							}
						},
						movedown: function(amount) {
							if((this.posy+this.height/2) < $scope.height-8) {
								this.posy+=amount;
							}
						}
					}


			//CONTROL OF GAME LOOP
			$scope.start = function () {
				$scope.gameLoop = $interval( function() {
					//THE GAME LOOP
					$scope.myBall.move();
					//CHECK INPUTS
					if($scope.p1up){ $scope.myPaddleOne.moveup(10)};
					if($scope.p1down) $scope.myPaddleOne.movedown(10); 
					if($scope.p2up) $scope.myPaddleTwo.moveup(10);
					if($scope.p2down) $scope.myPaddleTwo.movedown(10);
					//RENDER/UPDATE SVG
					$scope.$broadcast('drawFrame');
				}, parseInt(1000/$scope.fps));
			}
			$scope.stop = function () {
				$interval.cancel($scope.gameLoop);
			}
			$scope.toggle = function () {
				$scope.playing ? ($scope.stop(),$scope.playing=false):($scope.start(),$scope.playing=true);
			}
			$scope.reset = function () {
				$scope.myPaddleOne.score = 0;
				$scope.myPaddleTwo.score = 0;
				$scope.myBall.reset();
			}
				
			$scope.keyDown = function (e) {
				if(e.keyCode==87) $scope.p1up = true;
				if(e.keyCode==83) $scope.p1down = true;
				if(e.keyCode==79) $scope.p2up = true; 
				if(e.keyCode==76) $scope.p2down = true; 	
				//console.log($scope.p1up + ','+$scope.p1down + ','+$scope.p2up + ','+$scope.p2down + ',')
					
			}
			$scope.keyUp = function (e) {

				if(e.keyCode==87) $scope.p1up = false;
				if(e.keyCode==83) $scope.p1down = false;
				if(e.keyCode==79) $scope.p2up = false; 
				if(e.keyCode==76) $scope.p2down = false; 

			}

			//instantiate game objects
			$scope.myBall = new BallObject();
			$scope.myPaddleOne = new PaddleObject("one");
			$scope.myPaddleTwo = new PaddleObject("two");
				}],
				link: function(scope, element, attrs) {
					scope.width = element[0].clientWidth;
					scope.height = 600;
					scope.buffer = 30;

					var el = d3.select(element[0]);
					var svg = el.append('svg')
								.attr('width', scope.width)
								.attr('height', scope.height)
								.attr('id', 'svgContainer');


					var background = svg.append('g')
										.append('rect')
										.attr('class','background')
										.attr('x',0)
										.attr('y',0)
										.attr('width', scope.width)
										.attr('height', scope.height)
										.attr('fill', 'black');

					//enter
					var ball = svg.append('g').append('circle')
								.attr('r', scope.myBall.r)
								.attr('cx', scope.width/2)
								.attr('cy', scope.height/2)
								.style('fill', 'chartreuse');

					
					var paddleOne = svg.append('g').append('line')
										.attr('x1', (scope.buffer+scope.myPaddleTwo.s_width))
										.attr('x2', (scope.buffer+scope.myPaddleTwo.s_width))
										.attr('y1', function() {return scope.myPaddleOne.posy-scope.myPaddleOne.height/2 } )
										.attr('y2', function() {return scope.myPaddleOne.posy+scope.myPaddleOne.height/2 } ) 
										.style('stroke-width', scope.myPaddleOne.s_width)
										.style('stroke-linecap', 'round')
										.style('stroke','chartreuse');


				
					var paddleTwo = svg.append('g').append('line')
										.attr('x1', scope.width-(scope.buffer+scope.myPaddleTwo.s_width))
										.attr('x2', scope.width-(scope.buffer+scope.myPaddleTwo.s_width))
										.attr('y1', function() {return scope.myPaddleTwo.posy-scope.myPaddleTwo.height/2 } )
										.attr('y2', function() {return scope.myPaddleTwo.posy+scope.myPaddleTwo.height/2 } ) 
										.style('stroke-width', scope.myPaddleTwo.s_width)
										.style('stroke-linecap', 'round')
										.style('stroke','chartreuse');
					//instead of update?  								
					scope.$on('drawFrame', function(event, args) {
						paddleOne
							//.transition('elastic')
							.attr('y1', function() {return scope.myPaddleOne.posy-scope.myPaddleOne.height/2 } )
							.attr('y2', function() {return scope.myPaddleOne.posy+scope.myPaddleOne.height/2 });

						paddleTwo
							//.transition('elastic')
							.attr('y1', function() {return scope.myPaddleTwo.posy-scope.myPaddleTwo.height/2 } )
							.attr('y2', function() {return scope.myPaddleTwo.posy+scope.myPaddleTwo.height/2 });

						ball
							.attr('class','game-ball')
							.attr('cx', function() {
								return scope.myBall.x;
							})
							.attr('cy', function() {
								return scope.myBall.y;
							});	
					});

			
		}
	}

});