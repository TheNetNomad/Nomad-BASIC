import promptSync from 'prompt-sync';
const prompt = promptSync();

import { create, all } from 'mathjs';
const math = create(all);

//all of our input will be parsed as uppercase, making all native mathjs functions inaccessible 
//this means we must expose them with uppercase names, and can rename for BASIC as appropriate
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
var splitLine;
var scope = {};
var output;
var stack = [];
var ifTest;

console.log("NOMAD BASIC V0.1 BETA");


while(!quit){
	console.log("OK");
	currentLine = "terminal";
	var input = prompt().toUpperCase();
	parse(input);
}

function parse(line){
	//console.log("parsing " + line + "...");
	line = (line + "").trim();
	
	splitLine = line.split(/ (.*)/s);
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
				console.log(error.toString().split("\n")[0]   + " in " + currentLine);
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
				console.log("Error: Invalid line number in " + currentLine);
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
				console.log("Error: Invalid line number in " + currentLine);
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
						console.log(output._data)
						break;
						
					default:
						console.log(output);
				}
			} catch (error) {
				console.log(error.toString().split("\n" )[0]  + " in " + currentLine);
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
					console.log(i + " " + program[i]);
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
					console.log(error.toString().split("\n")[0]   + " in " + currentLine);
					if(currentLine != "terminal"){
						quit = true;
					}
				}
			}
	}
	return null;
}
