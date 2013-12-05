/**
Project: Highway Rush FFOS
Author: Szalontai István
Email: istvan.szalontai12@gmail.com
Licence: GPL

TODO
- github

Useful links:
---------------
https://twitter.com/SzalontaiIstvan
https://marketplace.firefox.com/developers/
https://github.com/pisti72/highway-rush
http://code.google.com/p/highway-rush/
*/


var musicTitle, musicIngame, sndCoin1, sndCoin2, sndCoin3, sndClick, sndAccident, sndTires, sndRoadworks;
// create an array of assets to load
var assetsToLoader = ["gfx/gfx.json"];//can be more than one json

// create a new loader
loader = new PIXI.AssetLoader(assetsToLoader);
	
// use callback
loader.onComplete = onAssetsLoaded
	
//begin load
loader.load();

//start
var version = '1.0';
var carFrames = ["car_gold.png", "car_magenta.png", "car_cyan.png", "truck_blue.png", "car_red.png", "car_yellow.png", "truck_green.png"];
var coinFrames = ["coin1.png", "coin2.png", "coin3.png", "coin4.png", "coin5.png", "coin6.png"];
var sptCoins = [];
var rectCoins = [];
var coinn = 6;
var switchCoin = 1;
var counterCoin = 3;
var rectCoin;
var coinEmitterRadian = 0;
const COINWAVELENGTH = 0.6;
const COINPERIOD = 120;
var counter = 0;
var carXOffset = [0,0,0,8,0,0,3];
var sptCars = [];
var typeCars = [];
var rectCars = [];
var carn = 10;
const CARPERIOD = 230;

var score = 0;
var scoreTarget = 0;

var isPaused = false;
const STATE_GAME = 0;
const STATE_TITLE = 1;
const STATE_END = 2;
const STATE_CREDITS = 3;
var interactive = true;	
var roadn = 5;

var roadposition = 0;
const LANEWIDTH = 66;
const LANEBEGIN = 104;
const ROADHEIGHT = 134;
const CARSSPEED = 5;
const BEGINSPEED = 6;
const MAXSPEED = 12;
const SLOWDOWN = 0.7;
const ACCELERATION = 0.006;
var speed = BEGINSPEED;

const TURNLEFT = 0;
const TURNRIGHT = 1;
const TURNNONE = 2;
const TURNSPEED = 6;//6*11=LANEWIDTH
var mycar;
var rectMycar;
var steering = TURNNONE;

var roads = [];
var state = STATE_TITLE;

//create global Sprites and Texts to switch their visibility globaly
var bigscoreText, infoText, info_bg, sptSteerLeft, sptSteerRight, btn_home, btn_sound, btn_play, btn_pause, btn_exit, btn_info, btn_tweet, sptTitle, sptRoadwork, txtVersion;
var isRoadworkNew;

window.onload = init;

if(!localStorage.hiscore)localStorage.hiscore = '0';
if(!localStorage.setting)localStorage.setting = 's';

// create an new instance of a pixi stage
var stage = new PIXI.Stage(0xFFFFFF, interactive);
	
// create a renderer instance.
renderer = PIXI.autoDetectRenderer(320, 480);//keon screen size is better and faster we lost sharpnes

// add the renderer view element to the DOM
document.body.appendChild(renderer.view);

// create an empty container
var gameContainer = new PIXI.DisplayObjectContainer();
gameContainer.position.x = 0;
gameContainer.position.y = 0;
stage.addChild(gameContainer);

var guiContainer = new PIXI.DisplayObjectContainer();
guiContainer.position.x = 0;
guiContainer.position.y = 0;
stage.addChild(guiContainer);

function init()
{
	sndCoin1 = document.getElementById('coin1');
	sndCoin2 = document.getElementById('coin2');
	sndCoin3 = document.getElementById('coin3');
	sndClick = document.getElementById('click');
	sndAccident = document.getElementById('accident');
	sndTires = document.getElementById('tires');
	sndRoadworks = document.getElementById('roadworkbreak');
	musicTitle = document.getElementById('music_title');
	musicTitle.loop = true;
	musicIngame = document.getElementById('music_ingame');
	musicIngame.loop = true;
	
	inicTitle();
}

function inicStage()
{
	//coins
	for (var i=0; i<coinn; i++)
	{
		coinEmitterRadian += COINWAVELENGTH;
		sptCoins[i].position.x = LANEBEGIN + LANEWIDTH + Math.sin(coinEmitterRadian)*LANEWIDTH;
		sptCoins[i].position.y = -720+i*COINPERIOD;
		rectCoins[i] = new PIXI.Rectangle(sptCoins[i].position.x-sptCoins[i].width/2, sptCoins[i].position.y-sptCoins[i].height/2, sptCoins[i].width, sptCoins[i].height);
	}
	//roadworks
	sptRoadwork.setTexture(PIXI.Texture.fromFrame('roadworks.png'));
	sptRoadwork.position.x = LANEBEGIN + random(0,2)*LANEWIDTH;
	sptRoadwork.position.y = -3600;
	//cars
	for (var i=0; i<carn; i++)
	{
		var type = random(0, 6);
		sptCars[i].position.x = LANEBEGIN + random(0,2)*LANEWIDTH + carXOffset[type];
		sptCars[i].position.y = (i-10)*CARPERIOD;
		sptCars[i].setTexture(PIXI.Texture.fromFrame(carFrames[type]));
		rectCars[i] = new PIXI.Rectangle(sptCars[i].position.x-sptCars[i].width/2+7, sptCars[i].position.y-sptCars[i].height/2+42, LANEWIDTH-23, sptCars[i].height-30);
	}
	
	//my car
	steering = TURNNONE;
	mycar.setTexture(PIXI.Texture.fromFrame("mycar_forward.png"));
	mycar.position.x = LANEBEGIN+LANEWIDTH;
	mycar.position.y = 360;
	mycar.visible = true;
	speed = BEGINSPEED;
	
	//scores
	score = 0;
	scoreTarget =0;
	counter = 0;
	
	//musics
	musicTitle.pause();
	if(localStorage.setting == 's')musicIngame.play();
	
	
}

function inicTitle()
{
	sndClick.play();
	
	bigscoreText.visible = false;
	infoText.visible = false;
	txtVersion.visible = false;
	btn_home.visible = false;
	info_bg.visible = false;
	mycar.visible = false;
	sptSteerLeft.visible = false;
	sptSteerRight.visible = false;
	btn_eraser.visible = false;
	btn_pause.visible = false;

	sptTitle.visible = true;
	btn_play.visible = true;
	btn_exit.visible = true;
	btn_info.visible = true;
	btn_sound.visible = true;
	btn_tweet.visible = true;
	
	isPaused = false;
	state = STATE_TITLE;
	musicIngame.pause();
	if(localStorage.setting == 's')musicTitle.play();
}

function onAssetsLoaded()
{
	// create roads array
	for (var i=0; i<roadn; i++)
	{
		var sptRoad = PIXI.Sprite.fromFrame("road1.png");//every road needs new Sprite object
		sptRoad.position.x = 167;
		sptRoad.position.y = (i-1)*ROADHEIGHT+roadposition;
		sptRoad.anchor.x = 0.5;
		sptRoad.anchor.y = 0.5;
		roads.push(sptRoad);
	
		gameContainer.addChild(sptRoad);//így az út csak a gameContainerben látható
	}

	// create coin array
	for (var i=0; i<coinn; i++)
	{
		// create a car using the frame name..
		var sptCoin = PIXI.Sprite.fromFrame("coin1.png");
		sptCoin.position.x = LANEBEGIN + random(0,2)*LANEWIDTH;
		sptCoin.position.y = -1800;
		sptCoin.anchor.x = 0.5;
		sptCoin.anchor.y = 0.5;
		sptCoins.push(sptCoin);
		gameContainer.addChild(sptCoin);
		rectCoins.push(new PIXI.Rectangle(sptCoin.position.x-sptCoin.width/2, sptCoin.position.y-sptCoin.height/2, sptCoin.width, sptCoin.height));
	}
	
	
	
	//create roadworks
	sptRoadwork = PIXI.Sprite.fromFrame("roadworks.png");
	sptRoadwork.position.x = LANEBEGIN + random(0,2)*LANEWIDTH;
	sptRoadwork.position.y = -3600;
	sptRoadwork.anchor.x = 0.5;
	sptRoadwork.anchor.y = 0.5;
	gameContainer.addChild(sptRoadwork);
	rectRoadwork = new PIXI.Rectangle(sptRoadwork.position.x-sptRoadwork.width/2, sptRoadwork.position.y-sptRoadwork.height/2, sptRoadwork.width, sptRoadwork.height);
	isRoadworkNew = true;
	
	//roadworks.interactive = true;
	//roadworks.visible = false;
		
	// create cars array
	for (var i=0; i<carn; i++)
	{
		// create a car using the frame name..
		var sptCar = PIXI.Sprite.fromFrame(carFrames[i%7]);
		sptCar.position.y = -2000;
		sptCar.anchor.x = 0.5;
		sptCar.anchor.y = 0.5;
		sptCars.push(sptCar);
		gameContainer.addChild(sptCar);
		rectCars.push(new PIXI.Rectangle(sptCar.position.x-sptCar.width/2+10, sptCar.position.y-sptCar.height/2+20, LANEWIDTH-35, sptCar.height-50));
	}
	
	mycar = PIXI.Sprite.fromFrame("mycar_forward.png");
	mycar.position.x = LANEBEGIN+LANEWIDTH;
	mycar.position.y = 360;
	mycar.anchor.x = 0.5;
	mycar.anchor.y = 0.5;
	mycar.visible = false;
	rectMycar = new PIXI.Rectangle(mycar.position.x-mycar.width/2+7, mycar.position.y-mycar.height/2+9, 60, 80);
	
	sptSteerLeft = PIXI.Sprite.fromFrame("touch_left.png");
	sptSteerLeft.position.x = 0;
	sptSteerLeft.position.y = 480;
	sptSteerLeft.anchor.y = 1;
	sptSteerLeft.visible = false;
	sptSteerLeft.interactive = true;
	sptSteerLeft.mousedown/* = sptSteerLeft.touchstart*/ = function(data){
		if(state == STATE_GAME)
		{
			steering = TURNLEFT;
			mycar.setTexture(PIXI.Texture.fromFrame("mycar_left.png"));
		}
	}
	
	sptSteerRight = PIXI.Sprite.fromFrame("touch_right.png");
	sptSteerRight.position.x = 160;
	sptSteerRight.position.y = 480;
	sptSteerRight.anchor.y = 1;
	sptSteerRight.visible = false;
	sptSteerRight.interactive = true;
	sptSteerRight.mousedown/* = sptSteerRight.touchstart*/ = function(data){
		if(state == STATE_GAME)
		{
			steering = TURNRIGHT;
			mycar.setTexture(PIXI.Texture.fromFrame("mycar_right.png"));
		}
	}
	
	//steer my car with arrow keys
	window.addEventListener("keydown", function(e){
		if(state == STATE_GAME)
		{
			if(e.which == 37)
			{
				steering = TURNLEFT;
				mycar.setTexture(PIXI.Texture.fromFrame("mycar_left.png"));
			}
			if(e.which == 39)
			{
				steering = TURNRIGHT;
				mycar.setTexture(PIXI.Texture.fromFrame("mycar_right.png"));
			}
		}
	}, false);
		
	sptTitle = PIXI.Sprite.fromFrame("title_en.png");
	if(isLang('hu'))sptTitle = PIXI.Sprite.fromFrame("title_hu.png");
	if(isLang('es'))sptTitle = PIXI.Sprite.fromFrame("title_es.png");
	sptTitle.position.x = 160;
	sptTitle.position.y = 190;
	sptTitle.anchor.x = 0.5;
	sptTitle.anchor.y = 0.5;
		
	btn_play = PIXI.Sprite.fromFrame("btn_play.png");
	btn_play.position.x = 160;
	btn_play.position.y = 350;
	btn_play.anchor.x = 0.5;
	btn_play.anchor.y = 0.5;
	
	// make the button interactive..		
	btn_play.interactive = true;
	// set the mousedown and touchstart callback..
	btn_play.mousedown/* = btn_play.touchstart*/ = function(data){
		state = STATE_GAME;
		this.visible = false;
		sptTitle.visible = false;
		btn_sound.visible = false;
		btn_exit.visible = false;
		btn_info.visible = false;
		btn_tweet.visible = false;
		
		btn_home.visible = true;
		btn_pause.visible = true;
		sptSteerLeft.visible = true;
		sptSteerRight.visible = true;
		bigscoreText.visible = true;
		
		inicStage();
		
		sndClick.play();
	}

	btn_sound = PIXI.Sprite.fromFrame("btn_loud.png");
	btn_sound.position.x = 320-100;
	btn_sound.position.y = 35;
	btn_sound.anchor.x = 0.5;
	btn_sound.anchor.y = 0.5;
	btn_sound.interactive = true;
	if(localStorage.setting != 's')btn_sound.setTexture(PIXI.Texture.fromFrame("btn_silent.png"));
	btn_sound.mousedown/* = btn_sound.touchstart*/ = function(data){
		if(localStorage.setting == 's')
		{
			btn_sound.setTexture(PIXI.Texture.fromFrame("btn_silent.png"));
			localStorage.setting = 'n';
			musicTitle.pause();
		}else{
			btn_sound.setTexture(PIXI.Texture.fromFrame("btn_loud.png"));
			localStorage.setting = 's';
			musicTitle.play();
		}
		sndClick.play();
	}
	
	btn_pause = PIXI.Sprite.fromFrame("btn_pause.png");
	btn_pause.position.x = 320-100;
	btn_pause.position.y = 35;
	btn_pause.anchor.x = 0.5;
	btn_pause.anchor.y = 0.5;
	btn_pause.visible = false;
	btn_pause.interactive = true;
	btn_pause.mousedown = function(data){
		isPaused = !isPaused;
		sndClick.play();
	}

	btn_home = PIXI.Sprite.fromFrame("btn_home.png");
	btn_home.position.x = 320-35;
	btn_home.position.y = 35;
	btn_home.anchor.x = 0.5;
	btn_home.anchor.y = 0.5;
	btn_home.visible = false;
	btn_home.interactive = true;
	btn_home.mousedown/* = btn_home.touchstart*/ = function(data){inicTitle();}
	
	btn_exit = PIXI.Sprite.fromFrame("btn_exit.png");
	btn_exit.position.x = 320-35;
	btn_exit.position.y = 35;
	btn_exit.anchor.x = 0.5;
	btn_exit.anchor.y = 0.5;
	btn_exit.visible = true;
	btn_exit.interactive = true;
	btn_exit.mousedown/* = btn_exit.touchstart*/ = function(data){
		sndClick.play();
		window.close();
	}
		
	btn_info = PIXI.Sprite.fromFrame("btn_info.png");
	btn_info.position.x = 320-165;
	btn_info.position.y = 35;
	btn_info.anchor.x = 0.5;
	btn_info.anchor.y = 0.5;
	btn_info.interactive = true;
	btn_info.mousedown/* = btn_info.touchstart */= function(data){
		this.visible = false;
		sptTitle.visible = false;
		btn_play.visible = false;
		btn_exit.visible = false;
		btn_home.visible = true;
		btn_sound.visible = false;
		
		btn_eraser.visible = true;
		info_bg.visible = true;
		infoText.setText(getLangText('INFO')+'\n\n'+getLangText('BEST')+formatnumber(localStorage.hiscore,6));
		infoText.setStyle({font: "13px Sans-Serif", fill: "#FFFFFF", align: "center", stroke: "#A04000", strokeThickness: 2});
		infoText.visible = true;
		txtVersion.visible = true;
		
		sndClick.play();
	}
	
	btn_tweet = PIXI.Sprite.fromFrame("btn_tweet.png");
	btn_tweet.position.x = 40;
	btn_tweet.position.y = 480-40;
	btn_tweet.anchor.x = 0.5;
	btn_tweet.anchor.y = 0.5;
	btn_tweet.interactive = true;
	btn_tweet.mousedown/* = btn_info.touchstart */= function(data){
		window.location.assign("https://twitter.com/SzalontaiIstvan")
		sndClick.play();
	}
	btn_eraser = PIXI.Sprite.fromFrame("btn_eraser.png");
	btn_eraser.position.x = 320-100;
	btn_eraser.position.y = 35;
	btn_eraser.anchor.x = 0.5;
	btn_eraser.anchor.y = 0.5;
	btn_eraser.visible = false;
	btn_eraser.interactive = true;
	
	btn_eraser.mousedown/* = btn_info.touchstart */= function(data){
		localStorage.hiscore = '0';
		infoText.setText(getLangText('INFO')+'\n\n'+getLangText('BEST')+formatnumber(localStorage.hiscore,6));
		sndClick.play();
	}
	
	info_bg = PIXI.Sprite.fromFrame("info_bg.png");
	info_bg.position.x = 160;
	info_bg.position.y = 240;
	info_bg.anchor.x = 0.5;
	info_bg.anchor.y = 0.5;
	info_bg.interactive = true;
	info_bg.visible = false;
	info_bg.mousedown/* = info_bg.touchstart*/ = function(data){inicTitle();}
		
	bigscoreText = new PIXI.Text("00000", {font: "35px Sans-Serif", fill: "#FFFFFF", align: "left", stroke: "#A04000", strokeThickness: 4});
	bigscoreText.position.x = 10;
	bigscoreText.position.y = 10;
	bigscoreText.visible = false;
	
	infoText = new PIXI.Text("00000", {font: "26px Sans-Serif", fill: "#FFFFFF", align: "center", stroke: "#A04000", strokeThickness: 2});
	infoText.position.x = 160;
	infoText.position.y = 156;
	infoText.anchor.x = 0.5;
	infoText.visible = false;
	
	txtVersion = new PIXI.Text('v'+version, {font: "10px Sans-Serif", fill: "#FFFFFF", align: "right", stroke: "#A04000", strokeThickness: 2});
	txtVersion.position.x = 300;
	txtVersion.position.y = 460;
	txtVersion.anchor.x = 0.5;
	txtVersion.visible = false;
	
	gameContainer.addChild(mycar);
	guiContainer.addChild(sptTitle);
	guiContainer.addChild(btn_play);
	guiContainer.addChild(btn_sound);
	guiContainer.addChild(btn_pause);
	guiContainer.addChild(btn_exit);
	guiContainer.addChild(btn_info);
	guiContainer.addChild(btn_eraser);
	guiContainer.addChild(btn_tweet);
	guiContainer.addChild(sptSteerLeft);
	guiContainer.addChild(sptSteerRight);
	guiContainer.addChild(btn_home);
	guiContainer.addChild(info_bg);
	guiContainer.addChild(bigscoreText);
	guiContainer.addChild(infoText);
	guiContainer.addChild(txtVersion);
	
	//inic
	//inicStage();
	
	// start animating
	requestAnimFrame( animate );
}	
	
function animate()
{
	requestAnimFrame( animate );
	if(!isPaused)
	{
		//increase speed and score
		if(state == STATE_GAME)
		{
			speed += ACCELERATION;
			if(speed > MAXSPEED)speed = MAXSPEED;
			scoreTarget +=.1;
		}
		//animate coins
		counter++;
		for(var i=0; i<coinn; i++)
			sptCoins[i].setTexture(PIXI.Texture.fromFrame(coinFrames[(counter>>2)%6]));
		
		if(state == STATE_GAME)//is first time?
		{
			//animate score
			if(score < scoreTarget && counter%2 == 0)score++;
			
			//animate left touch area
			if(counter < 100 && counter%(20-counter/10) > 5)
			{
				sptSteerLeft.alpha = 1;
			}else
			{
				sptSteerLeft.alpha = 0;
			}
			
			//and right touch area
			if(counter > 100 && counter < 200 && counter%(30-counter/10) > 5)
			{
				sptSteerRight.alpha = 1;
			}else
			{
				sptSteerRight.alpha = 0;
			}
		}
		
		//move road like conveyor
		if(state == STATE_GAME || state == STATE_TITLE)roadposition += speed;

		for (var i=0; i<roadn; i++)
		{
			roads[i].position.y = (i-1)*ROADHEIGHT+roadposition;//ez rámutat
			if(roadposition >= ROADHEIGHT)roadposition-=ROADHEIGHT;
		}
		
		//move cars, coin and roadwork down
		if(state == STATE_GAME || state == STATE_TITLE)
		{
			//move coins
			for (var i=0; i<coinn; i++)
			{
				if(sptCoins[i].position.y > COINPERIOD*6)
				{
					counterCoin--;
					if(counterCoin <= 0)
					{
						switchCoin *= (-1);
						counterCoin = random(5,20);
					}	
					coinEmitterRadian += COINWAVELENGTH;
					sptCoins[i].position.x = LANEBEGIN + LANEWIDTH + Math.sin(coinEmitterRadian)*LANEWIDTH;
					if(switchCoin > 0)sptCoins[i].position.x = 9999;
					sptCoins[i].position.y -= COINPERIOD*6;
				}else
				{
					sptCoins[i].position.y += speed;
				}
				rectCoins[i].x = sptCoins[i].position.x-sptCoins[i].width/2;
				rectCoins[i].y = sptCoins[i].position.y-sptCoins[i].height/2;
			}
			
			//move roadwork
			if(sptRoadwork.position.y > 500)
			{
				sptRoadwork.position.x = LANEBEGIN + random(0,2)*LANEWIDTH;
				var distance = score;
				if (distance > 2200) distance = 2200;
				if (speed > MAXSPEED-3)distance = 500;
				sptRoadwork.position.y = -random(distance, distance+1000);
				sptRoadwork.setTexture(PIXI.Texture.fromFrame('roadworks.png'));
				isRoadworkNew = true;
				console.log(speed);
			}else
			{
				sptRoadwork.position.y += speed;
			}
			rectRoadwork.x = sptRoadwork.position.x-sptRoadwork.width/2;
			rectRoadwork.y = sptRoadwork.position.y-sptRoadwork.height/2;
			
			//move sptCars
			for (var i=0; i<carn; i++)
			{
				sptCars[i].position.y += (speed-CARSSPEED);//ha ezt változtatom, akkor 
				if(sptCars[i].position.y > CARPERIOD*3)
				{
					var type = random(0, 6);
					sptCars[i].position.x = LANEBEGIN + random(0,2)*LANEWIDTH + carXOffset[type];
					sptCars[i].position.y += (-10)*CARPERIOD;
					sptCars[i].setTexture(PIXI.Texture.fromFrame(carFrames[type]));
					rectCars[i] = new PIXI.Rectangle(sptCars[i].position.x-sptCars[i].width/2+10, sptCars[i].position.y-sptCars[i].height/2+20, LANEWIDTH-35, sptCars[i].height-50)
				}
				//update rectangles
				rectCars[i].x = sptCars[i].position.x-sptCars[i].width/2+10;
				rectCars[i].y = sptCars[i].position.y-sptCars[i].height/2+20;
			}
		
			//move my car left
			if(steering == TURNLEFT)
			{
				if(localStorage.setting == 's')sndTires.play();
				mycar.position.x -= TURNSPEED;
				if(mycar.position.x<LANEBEGIN)mycar.position.x = LANEBEGIN;
				if((mycar.position.x-LANEBEGIN)%LANEWIDTH == 0)
				{
					steering=TURNNONE;
					mycar.setTexture(PIXI.Texture.fromFrame("mycar_forward.png"));
				}
			}
			
			//move my car right
			if(steering == TURNRIGHT)
			{
				if(localStorage.setting == 's')sndTires.play();
				mycar.position.x += TURNSPEED;
				if(mycar.position.x>LANEBEGIN+2*LANEWIDTH)mycar.position.x=LANEBEGIN+2*LANEWIDTH;
				if((mycar.position.x-LANEBEGIN)%LANEWIDTH == 0)
				{
					steering=TURNNONE;
					mycar.setTexture(PIXI.Texture.fromFrame("mycar_forward.png"));
				}
			}
			rectMycar.x = mycar.position.x-mycar.width/2+10;
			rectMycar.y = mycar.position.y-mycar.height/2+15;
			
			//move the container
			gameContainer.position.x =(LANEBEGIN+LANEWIDTH - mycar.position.x)>>1;
		}
		
		if(state == STATE_GAME)
		{
			//hit test with cars
			for (var i=0; i<carn; i++)
			{
				if(intersectRect(rectCars[i], rectMycar))
				{
					if(localStorage.setting == 's')sndAccident.play();
					if(score > Number(localStorage.hiscore))localStorage.hiscore = score;
					infoText.setText(getLangText('SCORE')+formatnumber(score,6)+'\n\n'+getLangText('BEST')+formatnumber(localStorage.hiscore,6));
					infoText.setStyle({font: "16px Sans-Serif", fill: "#FFFFFF", align: "center", stroke: "#A04000", strokeThickness: 2});
					infoText.visible = true;
					info_bg.visible = true;
					btn_pause.visible = false;  
					state = STATE_END;
				}
			}
			//hit test with coins
			for (var i=0; i<coinn; i++)
			{
				if(intersectRect(rectCoins[i], rectMycar))
				{
					sptCoins[i].position.x = 9999;
					scoreTarget += 10;
					if(localStorage.setting == 's')
					{
						if(i%3 == 0)sndCoin1.play();
						if(i%3 == 1)sndCoin2.play();
						if(i%3 == 2)sndCoin3.play();
					}
				}
			}
			
			//hit test with roadwork
			if(intersectRect(rectRoadwork, rectMycar) && isRoadworkNew)
			{
				isRoadworkNew = false;
				sptRoadwork.setTexture(PIXI.Texture.fromFrame('roadworks_broken.png'));
				scoreTarget += 50;
				speed *= SLOWDOWN;
				if(speed < BEGINSPEED) speed = BEGINSPEED;
				if(localStorage.setting == 's')sndRoadworks.play();
			}
		}
	}
	bigscoreText.setText(formatnumber(score,6));
	//bigscoreText.setText(formatnumber(speed,6));
	
	// render the stage
	renderer.render(stage);
}

function intersectRect(r1, r2) {
  return !(r2.x > r1.x+r1.width || 
           r2.x+r2.width < r1.x || 
           r2.y > r1.y+r1.height ||
           r2.y+r2.height < r1.y);
}

function formatnumber(str, n)
{
	var t = '';
	str = '' + Math.floor(str);
	for(var i=0; i<n-str.length; i++) t+='0';
	t+=str;
	return t;
}

function isLang(lang)
{
	var str = navigator.language;
	//return -1 != str.search(lang);
	return lang == 'en';
}

//generates integer random number between a and b values
function random(a,b)
{
	var r = Math.floor(Math.random()*(b-a+1))+a;
	return r;
}
