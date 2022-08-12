import { Client, GatewayIntentBits } from 'discord.js';
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

import { create, all } from 'mathjs';
const math = create(all);

math.import({
	'TYPE':		function (input) {			return math.typeOf(input)},
	'CONCAT':	function (str1,str2) {		return math.concat(str1,str2)},
	'ABS':		function (input) {			return math.abs(input)},
	'SQR':		function (input) {			return math.sqrt(input)},
	'EXP':		function (input) {			return math.exp(input)},
	'LOG':		function (input) {			return math.log(input)},
	'FIX':		function (input) {			return math.fix(input)},
	'INT':		function (input) {			return math.floor(input)},
	'SGN':		function (input) {			return math.sign(input)},
	'RND':		function (min,max) {		return math.randomInt(min,max)},
	'ATN':		function (input) {			return math.atan(input)},
	'COS':		function (input) {			return math.cos(input)},
	'SIN':		function (input) {			return math.sin(input)},
	'TAN':		function (input) {			return math.tan(input)},
	'HEX':		function (input) {			return math.hex(input).substring(2).toUpperCase()},
	'OCT':		function (input) {			return math.oct(input).substring(2).toUpperCase()},
	'BIN':		function (input) {			return math.bin(input).substring(2).toUpperCase()},
	'$H':		function (input) {			return parseInt(input,16)},
	'$O':		function (input) {			return parseInt(input,8)},
	'$B':		function (input) {			return parseInt(input,2)},
	'LEN':		function (input) {			return input.length},
	'LEFT':		function (input,len) {		return input.substring(0,len)},
	'RIGHT':	function (input,len) {		return input.substring(input.length - len,input.length)},
	'MID':		function (input,start,len) {return input.substring(start,start + len)},
	'INSTR':	function (str1,str2) { 		return str1.indexOf(str2)}
}, { override: true })

const basicEvaluate = math.evaluate;

var quit = false;
var currentLine;
var program = [];
var scope = {};
var output;
var stack = [];
var ifTest;
var lastChannel;

function parse(line){
	line = (line + "").trim();
	let splitLine = line.split(/ (.*)/s);
	
	if(line.indexOf("\n") > -1){
		line.split("\n").forEach(parse);
		return null;
	}
	
	if((splitLine[0] != "IF") &&(line.indexOf(":") > -1)){
		line.split(":").forEach(parse);
		return null;
	}

  //console.log("Evaluating " + line);
	switch(splitLine[0]) {
		case "REM":
			break;
		
		case "CLS":
			console.clear();
			break;
			
		case "CLEAR":
			scope = {};
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
			while(!quit && currentLine < program.length){
        if(program[currentLine] != null){
					parse(program[currentLine])
				}
				currentLine++;
			}
			break;
			
		case "LIST":
			for (let i = 0; i < program.length; i++) {
				if(program[i] != null){
					textOut(i + " " + program[i]);
				}
			}
			break;
			
		case "END":
			if(currentLine == "terminal"){
				quit = true;
			}
			else{
				currentLine = program.length - 2;
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
	lastChannel.send(x + "");
}

client.once('ready', c => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
  console.log("NOMAD BASIC V0.1 BETA");
  //console.log(client)
});

client.on("messageCreate", message => {
  console.log(message.author.username + ": " + message.content);
  //console.log(message.channel);

  if (message.author.id != client.user.id) {
    //message.channel.send("i can say whatever i want");
    lastChannel = message.channel;
    currentLine = "terminal";
	  var input = message.content.toUpperCase();
	  parse(input);
    textOut("OK");
  }
});

client.login(process.env.TOKEN);
