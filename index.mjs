import { Client, GatewayIntentBits, PermissionsBitField } from 'discord.js';
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent] });

import { create, all } from 'mathjs';
const allButTransforms = {}
Object.keys(all)
  .filter(key => !key.endsWith('Transform'))
  .forEach(key => {
    allButTransforms[key] = all[key]
})
const math = create(allButTransforms)

math.import({
	'add':		function (x,y) {				return x + y},
	'equal':	function (x,y) {				return x == y},
	'unequal':	function (x,y) {			return x != y},
	'TIME':		function () {
		timer = new Date();
		return timer.getTime();
	},
	'TYPE':		function (input) {			return math.typeOf(input).toUpperCase()},
	'CONCAT':	function (str1,str2) {	return math.concat(str1,str2)},
	'ABS':		function (input) {			return math.abs(input)},
	'SQR':		function (input) {			return math.sqrt(input)},
	'EXP':		function (input) {			return math.exp(input)},
	'LOG':		function (input) {			return math.log(input)},
	'FIX':		function (input) {			return math.fix(input)},
	'INT':		function (input) {			return math.floor(input)},
	'SGN':		function (input) {			return math.sign(input)},
	'RND':		function (min,max) {
		if(!isNaN(min) && !isNaN(max)){
			return math.randomInt(min,max+1);
		}
		else{
			return math.random();
		}
		
	},
	'ATN':		function (input) {			return math.atan(input)},
	'COS':		function (input) {			return math.cos(input)},
	'SIN':		function (input) {			return math.sin(input)},
	'TAN':		function (input) {			return math.tan(input)},
	'VAL':		function (input) {			return Number(input)},
	'HEX$':		function (input) {			return math.hex(input).substring(2).toUpperCase()},
	'OCT$':		function (input) {			return math.oct(input).substring(2).toUpperCase()},
	'BIN$':		function (input) {			return math.bin(input).substring(2).toUpperCase()},
	'$H':		function (input) {				return parseInt(input,16)},
	'$O':		function (input) {				return parseInt(input,8)},
	'$B':		function (input) {				return parseInt(input,2)},
	'LEN':		function (input) {			return input.length},
	'LEFT':		function (input,len) {		return input.substring(0,len)},
	'RIGHT':	function (input,len) {		return input.substring(input.length - len,input.length)},
	'MID':		function (input,start,len) {return input.substring(start,start + len)},
	'INSTR':	function (str1,str2) { 		return str1.indexOf(str2)},
	'PROMPT':	function (input) { 		
		if(currentLine == "terminal"){
			textOut("ERROR: PROMPT NOT VALID OUTSIDE PROGRAM");
			return 0;
		}
		
		if(wait == false){
			wait = true;
			if(input == ""){
				input = "?";
			}
			textOut(input + "** **");
			return 0;
		}
		else{
			promptLine = promptLine.toUpperCase();
			if(promptLine == "END"){
				currentLine = program.length ;
				textOut("PROGRAM TERMINATED");
			}
			return promptLine;
		}
	}
}, { override: true })


const basicEvaluate = math.evaluate;

var wait = false;
var quit = false;
var currentLine;
var program = [];
var scope = {};
var output;
var stack = [];
var ifTest;
var lastChannel;
var promptLine;
var timer = new Date();
var timeOut = false;
var timeLimit;
var messageBuffer = "";
var messageSizeError = false;

console.log("Initializing...");

function parse(line){
	timer = new Date();
	if (timer.getTime() > timeLimit){
		timeOut = true;
		return;
	}
	
	line = (line + "").trim();
	let splitLine = line.split(/ (.*)/s);
	
	console.log("Evaluating " + line)

	if((splitLine[0] != "IF" & isNaN(splitLine[0])) && (line.indexOf(":") > -1)){
		let inQuote = false;
		for (var i = 0; i < line.length; i++) {
		  if(line.charAt(i) == '"'){
				inQuote = !inQuote
			}
			if(!inQuote && line.charAt(i) == ":"){
				line = line.substring(0,i) + "\n" + line.substring(i+1);
			}
		}
	}
	
	if(line.indexOf("\n") > -1){
		line.split("\n").forEach(parse);
		return null;
	}

	switch(splitLine[0]) {
		case "REM":
			break;
		
		case "CLS":
			console.clear();
			break;
			
		case "CLEAR":
			scope = {};
			program = [];
			break;
			
		case "IF":
			if(splitLine[1].indexOf("ELSE") > -1){
				splitLine[1] = splitLine[1].split(/(THEN)((?:\n|.)*)(ELSE)/);
			}
			else{
				splitLine[1] = splitLine[1].split(/(THEN)(.*)/s);
			}
			
			try {
				ifTest = basicEvaluate(splitLine[1][0],scope);
			} catch (error) {
				textOut(error.toString().split("\n")[0]   + " in " + currentLine);
				if(currentLine != "terminal"){
					quit = true;
				}
			}
			
			if(ifTest){
				parse(splitLine[1][2],scope);
			}
			else{
				parse(splitLine[1][4],scope);
			}
			break;
			
		case "GOTO":
			splitLine[1] = parseInt(splitLine[1]);
			if(Number.isInteger(splitLine[1])){
				currentLine = parseInt(splitLine[1]) - 1;
			}
			else{
				textOut("Error: Invalid line number in " + currentLine);
				if(currentLine != "terminal"){
					quit = true;
				}
			}
			break;
			
		case "GOSUB":
			splitLine[1] = parseInt(splitLine[1]);
			if(Number.isInteger(splitLine[1])){
				stack.push(currentLine);
				currentLine = parseInt(splitLine[1]) - 1;
			}
			else{
				textOut("Error: Invalid line number in " + currentLine);
				if(currentLine != "terminal"){
					quit = true;
				}
			}
			break;
		
		case "RETURN":
			currentLine = stack.pop();
			break;

		case "INPUT":
			if(splitLine[1].indexOf(",") > -1){
				splitLine[1] = splitLine[1].split(",");
			
				if(splitLine[1][0] == ""){
					splitLine[1][0] = "?";
				}
				
				try {
					console.log(splitLine[1][1] + " = PROMPT(" + splitLine [1][0] + ")");
					basicEvaluate(splitLine[1][1] + " = PROMPT(" + splitLine [1][0] + ")",scope);
				} catch (error) {
					textOut(error.toString().split("\n")[0]   + " in " + currentLine);
					if(currentLine != "terminal"){
						quit = true;
					}
				}
				
			}
			else{
				try {
					basicEvaluate(splitLine[1] + ' = PROMPT("?")',scope);
				} catch (error) {
					textOut(error.toString().split("\n")[0]   + " in " + currentLine);
					if(currentLine != "terminal"){
						quit = true;
					}
				}	
			}
			break;
			
		
		case "PRINT":
			try {
				output = basicEvaluate(splitLine[1],scope);
				switch(math.typeOf(output)){
					case "Unit":
						break;
						
					case "DenseMatrix":
						textOut(output._data)
						break;
						
					default:
						textOut(output);
				}
			} catch (error) {
				textOut(error.toString().split("\n" )[0]  + " in " + currentLine);
				if(currentLine != "terminal"){
					quit = true;
				}
			}
			break;
		
		case "RUN":
			currentLine = 0;
			while((!quit && !wait) && currentLine < program.length){
        if(program[currentLine] != null){
					parse(program[currentLine])
				}
				currentLine++;
			}
			break;
			
		case "LIST":
			if(!isNaN(splitLine[1])){
				textOut(splitLine[1] + " " + program[splitLine[1]]);
			}
			else{
				for (let i = 0; i < program.length; i++) {
					if(program[i] != null){
						textOut(i + " " + program[i]);
					}
				}
			}
			
			break;
			
		case "END":
			if(currentLine == "terminal"){
				quit = true;
			}
			else{
				currentLine = program.length;
			}
			break;
		
		default:
			if(!isNaN(splitLine[0])){
				program[parseInt(splitLine[0])] = splitLine[1]; 
			}
			else{
				try {
					basicEvaluate(line,scope);
				} catch (error) {
					textOut(error.toString().split("\n")[0]   + " in " + currentLine);
					if(currentLine != "terminal"){
						quit = true;
					}
				}
			}
	}
	return null;
}

function textOut(x){
	x = x + "";
	if(messageBuffer.length + x.length <= 2000){
		messageBuffer += x + "\n";
	}
	else{
		messageSizeError = true;
		quit = true;
	}
}

client.once('ready', c => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
	client.channels.cache.forEach(channel => {
		if(channel.permissionsFor(client.user).has(PermissionsBitField.Flags.ViewChannel) & (channel.type==0)){
			channel.send("NOMAD BASIC V0.5 BETA")
			channel.send("OK")
		}
  })
});

client.on("messageCreate", message => {
  console.log(message.author.username + ": " + message.content);

  if (!(message.content.match(/<a?:.+?:\d+>/)) & (message.author.id != client.user.id)) {
    lastChannel = message.channel;
		timer = new Date();
		timeLimit = timer.getTime() + 5000;
		console.log("Time limit set to " + timeLimit);
	
		
		if(wait == false){
			currentLine = "terminal";
		  var input = message.content.toUpperCase();
		  parse(input);
		}
		else{
			promptLine = message.content;
			parse(program[currentLine - 1]);
			wait = false;
			while((!quit & !wait) & currentLine < program.length){
        if(program[currentLine] != null){
					parse(program[currentLine])
				}
				currentLine++;
			}
		}
		if(timeOut){
			timeOut = false;
			textOut("ERROR: MAXIMUM EXECUTION TIME EXCEEDED");
		}
		if(wait == false){
			textOut("OK");
		}
    
		lastChannel.send(messageBuffer.toUpperCase());
		messageBuffer = "";
		
		if(messageSizeError){	
			lastChannel.send("ERROR: MAXIMUM OUTPUT SIZE EXCEEDED");
		}
		messageSizeError = false;
		quit = false;
  }
});

console.log("Connecting...");
client.on('debug', console.log);
client.on('error', console.error);
client.on('warning', console.warn);
client.login(process.env.TOKEN);
