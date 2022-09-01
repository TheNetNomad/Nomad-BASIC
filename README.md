# Nomad-BASIC

A simple CLI BASIC interpretor for your discord server. Currently only supports one instance of the interepter, so must be self-hosted for each server and limitted in permissions to view only one channel.

[Try it out on _NomadNet](https://discord.gg/effsHwSs)

# NPM Dependencies 

[discord js](https://discord.js.org/#/)  
[mathjs](https://mathjs.org/)  
Your bot's token must be stored in the TOKEN environmental variable  

# Commands 

| Command | Usage |
| ------------- | ------------- |
| $B(x)  | Returns the decimal equivalent of the binary number in string x as a number|
| $H(x)  | Returns the decimal equivalent of the hexidecimal number in string x as a number|
| $O(x)  | Returns the decimal equivalent of the octal number in string x as a number|
| ABS(x)  | Returns the absolute value of x |
| ATN(x)  | Returns atan x |
| BIN$(x)  | Returns a string containing the binary representation of X |
| CLEAR | Clears all program lines and working storage|
| CONCAT(x,y)  | Concatenates string x and string y |
| COS(x)  | Returns cos x |
| END | Ends execution of program. Can be supplied as prompt input during program execution |
| EXP(x)  | Returns e to the power of x |
| FIX(x)  | Returns x rounded towards 0 |
| GOSUB x | Go to line number x and return here on RETURN command |
| GOTO x | Go to line number x|
| HEX$(x)  | Returns a string containing the hexadecimal representation of X |
| IF x THEN y [ELSE z]| Evaluates boolean expression X and performs statement y if true or z if false (and provided) |
| INPUT X | Evaluates X = PROMPT("?") |
| INPUT X,Y | Evaluates Y = PROMPT(X) |
| INSTR(x,y)  | Returns the position of string y within string x, or -1 if not present|
| INT(x)  | Returns x rounded downward |
| LEFT(x,y)  | Returns the leftmost y characters of string x as a string|
| LEN(x)  | Returns the length of x|
| LIST X | Lists program line x |
| LIST | Lists all program lines in storage |
| LOG(x)  | Returns the log of x |
| MID(x,y,z)  | Returns the first z characters of string x starting from position y as a string|
| OCT$(x)  | Returns a string containing the octal representation of X |
| PRINT X |Prints X to the screen |
| PROMPT(x)  | Prints the query in x to the terminal and returns user input|
| REM  | Prevents the rest of the line from being processed (i.e. designates a comment)|
| RETURN |Return to location of most recent GOSUB |
| RIGHT(x,y)  | Returns the rightmost y characters of string x as a string|
| RND()  | Returns a random number between 0 and 1 |
| RND(x,y)  | Returns a random integer between x and y |
| RUN | Runs program in storage |
| SGN(x)  | Returns the sign of x |
| SIN(x)  | Returns sin x |
| SQR(x)  | Returns the square root of x |
| TAN(x)  | Returns tan x |
| TIME()  | Returns number of milliseconds ellapsed since January 1, 1970. |
| TYPE(x)  | Returns the type of parameter x as a string  |
| VAL(x)  | Returns the number contained in string x as a number |

Lines are added to the program by writing the desired line number followed by the desired line. Standard mathematical operators can also be used.

# Differences from most BASICs
* Nothing is in real time, no reading of individual keystrokes or doing timed actions
* Spaces are required between all commands
* Variables do not need to be allocated before usage with DIM, DEFINT, LET et cetera. The only exception is arrays which must be allocated with AR = [] instead of DIM AR(x) 
* Array contents and set and retrieved with [] instead of ()
* Execution time is capped out at 1 second for each message sent (PROMPTing for INPUT resets this clock)
* Text output is limitted to 2000 characters (PROMPTing for INPUT resets this count)
* There is no FOR... NEXT or WHILE... WEND construct
* There is no PEAKing and POKEing
* There are no DATA or READ commands

# TODO
* Load program from attachment
* FOR...NEXT construct
* DATA/READ commands
* Drawing commands for image output (no real time support is planned)
* MML commands for audio output

# Known Issues
* INSTR() does not behave correctly in terminal mode
* TAB(x) only creates x amount of spaces instead of tabbing to column x 
