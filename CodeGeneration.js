/* Code_Generation.js */

function codeGen(tokenStream,ast,symbolTree,programCount){
	//initialize error tracking
	var cGErrorNum = 0;
	//intialize warning tracking
	var cGWarningNum = 0;
	//starter text for semantic analysis
	var regularTxt = "Starting Code Generator ... \nProgram " + programCount + " Code Generation \n";
	putMessage(regularTxt);
	//starter debugging text for semantic analysis
	var debugTxt = "Starting Code Generation ...\n ";
	var verbose = document.getElementById("CodeGenerationDebug").value
	var tokens = tokenStream;
	// LDA Load the accumulator with a constant 
	var ldaConst = "A9"; 
	// LDA Load the accumulator from memory 
	var ldaMem = "AD"; 
	// STA Store the accumulator in memory 
	var staMem = "8D"; 
	// ADC Adds contents of an address to the accumulator and keeps the result in the accumulator 
	var addWithCarry = "6D"; 
	// LDX Load the x register with a constant 
	var ldxConst = "A2"; 
	// LDX Load the x register from memory 
	var ldxMem = "AE"; 
	// LDY Load the y register with a constant 
	var ldyConst = "A0"; 
	// LDY Load the y register from memory 
	var ldyMem = "AC"; 
	// NOP No Operation 
	var nOp = "EA"; 
	// BRK Break (which is really a system call) 
	var brkOp = "00"; 
	// CPX Compare a byte in memory to the x register. Sets the z (zero) flag if equal 
	var compareMem2X = "EC"; 
	// BNE Branch n bytes if z flag = 0 
	var branch = "D0"; 
	// INC Increment the value of a byte 
	var incByte = "EE";
	// SYS System Call #$01 in x reg = print the integer stored in the y register. #$02 in x reg = print the 00-terminated string stored at the address in the y register 
	var sysCall = "FF"; 
	// error and warning variables
	var cGErrorNum = 0;
	var cGWarningNum = 0;
	var codeSegment = [];
	//static variable stuff: variables and tables 
	var staticVarSegment = [];
	var staticVarLoc = "";
	var staticVarLocTable = [];
	var staticVar = "T";
	var staticVarNum = -1;
	//variables for the backpatcher and stringpatcher
	var patchNum = 0;
	var patchTxt = "";
	//tables and variables to check and keep track of strings and their locatioon
	var stringSegment = ["00"];
	var stringHolder = "";
	var stringLoc = 0;
	var stringLocTable = [];
	var stringLength = [];
	var strExist = false;
	//branching table and variable
	var jumpTable = [];
	var branchLoc = 0;
	//array that contains the output
	var hexCode = [];
	//start code gen
	start();
	
	
	function start(){
		readAST(ast.root);
		stringPatch(strExist);
		backPatch();
		
	}
	//reads the ast and for each node on the tree it chooses a function to call
	function readAST(node){
		if (!node.children || node.children.length === 0) {
        	//putMessage("no children detected");

        }else{
			if (node.name == "Root"){
				//putMessage("root detected");
				genRoot(node.children);
				
			}else if (node.name == "Program"){
				genProgram(node.children);
				//putMessage("program detected");
			}else if (node.name == "Block"){
				//putMessage("block detected");
				genBlock(node.children);
				
			}else if (node.name == "VarDecl"){
				//putMessage("VarDecl detected");
				genVarDecl(node);
				
			}else if (node.name == "AssignmentStatement"){
				//putMessage("assignment detected");
				genAssign(node);
			}else if (node.name == "PrintStatement"){
				//putMessage("print detected");
				genPrint(node);
				
			}else if (node.name == "IfStatement"){
				//putMessage("if detected");
				genIf(node);
				
			}else if (node.name == "WhileStatement"){
				//putMessage("while detected");
				genwhile(node);
				
			}else if (node.name == "Addition") {
				genAddition(node);
				//return lnodeMemLoc;
			}
			else {
				for (var i = 0; i < node.children.length; i++) {
					readAST(node.children[i]);
				}
			}
		
		}
		
	}
	//adds hex code segments to be printed out on completion
	function addHexCode(hex){
		hexCode.push(hex);
 		if (verbose){
 			//printPushHex(hex);
		}
	}
	//AST starts with a root node so we start here
	function genRoot(node){
		
		for (var i = 0; i < node.length; i++) {
            readAST(node[i]);
        }
		
	}
	//detects the existence of a program
	function genProgram(node){
		
		for (var i = 0; i < node.length; i++) {
            readAST(node[i]);
        }
		
	}
	//detects and executes upon the block and what it contains
	function genBlock(node){
		branchLoc = 0;
		branchLoc++;
		for (var i = 0; i < node.length; i++) {
            readAST(node[i]);
        }
		
	}
	//code gen for variable declaration
	function genVarDecl(node){
		branchLoc++;
		staticVarNum++;
		var varType = node.children[0];
        var varID = node.children[1];
		if (node.children[0].name == "Int") {
			//putMessage("int detected");
			addHexCode(ldaConst);
        	addHexCode("00");
    		addHexCode(staMem);
			staticVarLoc = staticVar + staticVarNum.toString(16);
			//var tempStatic = new StaticVar (node.children[1].name, staticVarLoc);
			staticVarLocTable.push(staticVarLoc);
			addHexCode(staticVarLoc);
			addHexCode("00");
		}else if  (node.children[0].name == "Boolean") {
			//putMessage("boolean detected");
			addHexCode(ldaConst);
        	addHexCode("00");
    		addHexCode(staMem);
			staticVarLoc = staticVar + staticVarNum.toString(16);
			//var tempStatic = new StaticVar (node.children[1].name, staticVarLoc);
			staticVarLocTable.push(staticVarLoc);
			addHexCode(staticVarLoc);
			addHexCode("00");
		}else if (node.children[0].name == "String") {
			//putMessage("string detected");
			addHexCode(ldaConst);
        	addHexCode("00");
    		addHexCode(staMem);
			staticVarLoc = staticVar + staticVarNum.toString(16);
			//var tempStatic = new StaticVar (node.children[1].name, staticVarLoc);
			staticVarLocTable.push(staticVarLoc);
			addHexCode(staticVarLoc);
			addHexCode("00");
			strExist = true;
		}
		
		
		
	}
	//code gen for assignment it checks
	function genAssign(node){
		branchLoc++;
		var varValue = node.children[1];
        var varID = node.children[0];
		//putMessage(node.children[1].name);
		//putMessage(node.children[0].name);
		if (node.children[1].name === "1" ||node.children[1].name === "2" ||node.children[1].name === "3" ||node.children[1].name === "4" ||node.children[1].name === "5" ||node.children[1].name === "6" ||node.children[1].name === "7" || node.children[1].name === "8" || node.children[1].name === "9" ||node.children[1].name === "0"  ) {
			for(i=0;i<node.children.length;i++){
				if(node.children[i].name === "+"){
					//putMessage(i);
					if(i>0){
						//putMessage(node.children[(i-1)].name);
						var tempLeft = node.children[i-1];
						//putMessage(node.children[i+1].name);
						var tempRight = node.children[i+1];
						genAddition(node, tempLeft, tempRight);
					}
				}
			}//else{
				//putMessage("int assigned");
				addHexCode(ldaConst);
				addHexCode("0" + node.children[1].name);
				addHexCode(staMem);
				staticVarLoc = staticVar + staticVarNum.toString(16);
				
				addHexCode(staticVarLoc);
				addHexCode("00");
			//}
		}else if ((node.children[1].name == "True")||node.children[1].name == "False") {
			//putMessage("boolean assigned");
			if(node.children[1].name == "True"){
				addHexCode(ldaConst);
				addHexCode("01");
				addHexCode(staMem);
				staticVarLoc = staticVar + staticVarNum.toString(16);
				
				addHexCode(staticVarLoc);
				addHexCode("00");
			}else{
				addHexCode(ldaConst);
				addHexCode("00");
				addHexCode(staMem);
				staticVarLoc = staticVar + staticVarNum.toString(16);
				
				addHexCode(staticVarLoc);
				addHexCode("00");
			}
		}else if (node.children[1].name[0] == "\"") {
			branchLoc++;
			//putMessage("string assigned");
			for(i = 0; i < node.children[1].name.length; i++){
				stringHolder="";
				//putMessage(node.children[1].name[i]);
				if (node.children[1].name[i] === "\""){
					
				}else if(node.children[1].name[i] = ("a"||"b"||"c"||"d"||"e"||"f"||"g"||"h"||"i"||"j"||"k"||"l"||"m"||"n"||"o"||"p"||"q"||"r"||"s"||"t"||"u"||"v"||"w"||"x"||"y"||/*and*/"z")){
					//assigns the hex number for each letter of the string including spaces
					if(node.children[1].name[i] === "a"){
						stringHolder = "61";
					}else if(node.children[1].name[i] === "b"){
						stringHolder = "62";
					}else if(node.children[1].name[i] === "c"){
						stringHolder = "63";
					}else if(node.children[1].name[i] === "d"){
						stringHolder = "64";
					}else if(node.children[1].name[i] === "e"){
						stringHolder = "65";
					}else if(node.children[1].name[i] === "f"){
						stringHolder = "66";
					}else if(node.children[1].name[i] === "g"){
						stringHolder = "67";
					}else if(node.children[1].name[i] === "h"){
						stringHolder = "68";
					}else if(node.children[1].name[i] === "i"){
						stringHolder = "69";
					}else if(node.children[1].name[i] === "j"){
						stringHolder = "6A";
					}else if(node.children[1].name[i] === "k"){
						stringHolder = "6B";
					}else if(node.children[1].name[i] === "l"){
						stringHolder = "6C";
					}else if(node.children[1].name[i] === "m"){
						stringHolder = "6D";
					}else if(node.children[1].name[i] === "n"){
						stringHolder = "6E";
					}else if(node.children[1].name[i] === "o"){
						stringHolder = "6F";
					}else if(node.children[1].name[i] === "p"){
						stringHolder = "70";
					}else if(node.children[1].name[i] === "q"){
						stringHolder = "71";
					}else if(node.children[1].name[i] === "r"){
						stringHolder = "72";
					}else if(node.children[1].name[i] === "s"){
						stringHolder = "73";
					}else if(node.children[1].name[i] === "t"){
						stringHolder = "74";
					}else if(node.children[1].name[i] === "u"){
						stringHolder = "75";
					}else if(node.children[1].name[i] === "v"){
						stringHolder = "76";
					}else if(node.children[1].name[i] === "w"){
						stringHolder = "77";
					}else if(node.children[1].name[i] === "x"){
						stringHolder = "78";
					}else if(node.children[1].name[i] === "y"){
						stringHolder = "79";
					}else if(node.children[1].name[i] === /*and*/"z"){
						stringHolder = "7A";
					}else if(node.children[1].name[i] === " "){
						stringHolder = "20";
					}else{
						//putMessage("That definitely shouldn't have happened");
					}
				
				}else{
					//putMessage("That shouldn't have happened");
				}
				stringSegment = stringSegment + stringHolder;
				//putMessage(stringSegment);
			}
			stringSegment = stringSegment + "00";
			stringLength.push(stringSegment.length);
			//putMessage(stringLength);
			stringLoc++;
			stringLocTable.push("S"+stringLoc);
			addHexCode(ldaConst);
        	addHexCode("S"+stringLoc);
    		addHexCode(staMem);
		    staticVarLoc = staticVar + staticVarNum.toString(16);
			
			addHexCode(staticVarLoc);
			addHexCode("00");
		}else{
			putMessage("That shouldn't have happened");
		}
		for (var i = 0; i < node.length; i++) {
            readAST(node[i]);
        }
		//putMessage("Got in to assignment statement");
	}
	//code gen for print statement
	function genPrint(node){
		branchLoc++;
		//putMessage("print lives");
		//putMessage(node.children[0].name);
		if (node.children[0].name[0] === "\"") {
			//putMessage("detected string");
			addHexCode(ldyMem);
			staticVarLoc = staticVar + staticVarNum.toString(16);
			addHexCode(staticVarLoc);
			addHexCode("00");
			staticVarLocTable.push(staticVarLoc);
			addHexCode(ldxConst);
			addHexCode("02");
			addHexCode(sysCall);
		}else if(node.children[0].name === ("a"||"b"||"c"||"d"||"e"||"f"||"g"||"h"||"i"||"j"||"k"||"l"||"m"||"n"||"o"||"p"||"q"||"r"||"s"||"t"||"u"||"v"||"w"||"x"||"y"||/*and*/"z")){
			//putMessage("detected id");
			addHexCode(ldyMem);
			staticVarLoc = staticVar + staticVarNum.toString(16);
			addHexCode(staticVarLoc);
			addHexCode("00");
			staticVarLocTable.push(staticVarLoc);
			addHexCode(ldxConst);
			addHexCode("01");
			addHexCode(sysCall);
		}else if(node.children[0].name = ("0"||"1"||"2"||"3"||"4"||"5"||"6"||"7"||"8"||"9")){
			//putMessage("reached print digit");
			if((node.children.length > 1) && (node.children[1].name = "+")){
				var leftSide = node.children[0];
				var rightSide = node.children[2];
				genAddition(node, leftSide, rightSide);
				
			}
			addHexCode(ldyMem);
			
			staticVarLoc = staticVar + staticVarNum.toString(16);
			addHexCode(staticVarLoc);
			addHexCode("00");
			staticVarLocTable.push(staticVarLoc);
			addHexCode(ldxConst);
			addHexCode("01");
			addHexCode(sysCall);
			
		}else if(node.children[0].name == ("True"||"False")){
			//putMessage("boolean");
			if(node.children[0].name = "True"){
				addHexCode(ldyConst);
				addHexCode("01");
			}else{
				addHexCode(ldyConst);
				addHexCode("00");
			}
			
			addHexCode(ldxConst);
			addHexCode("01");
			addHexCode(sysCall);
		}else{
			putMessage("not detecting anything");
		}
		for (var i = 0; i < node.children[0].name.length; i++) {
			
		}
		addHexCode(ldyMem);
        staticVarLoc = staticVar + staticVarNum.toString(16);
		addHexCode(staticVarLoc);
		addHexCode("00");
		staticVarLocTable.push(staticVarLoc);
		addHexCode(ldxConst);
		addHexCode("01");
		addHexCode(sysCall);
			
		
		for (var i = 0; i < node.length; i++) {
            readAST(node[i]);
        }
		
	}
	//code gen for while statement
	function genwhile(node){
		branchLoc++;
		//putMessage("if lives");
		for (var i = 0; i < node.children.length; i++) {
			if(node.children[i].name === "Equality"){
				genEquality(node,node.children[i-1].name);
			}else if(node.children[i].name === "Non_Equality"){
				genNonEquality(node,node.children[i-1].name);
			
			}else if(node.children[i].name === (0||1||2||3||4||5||6||7||8||9)){
				addHexCode(ldxConst);
				addHexCode("0"+node.children[i].name);
				
			}/*else if(node.children[i].name[0] === "\""){
				addHexCode(ldxMem);
				for(j = 0; j < node.children[i].name.length; j++){
					stringHolder="";
					//putMessage(node.children[1].name[i]);
					if (node.children[1].name[i] === "\""){
						
					}else if(node.children[i].name[j] = ("a"||"b"||"c"||"d"||"e"||"f"||"g"||"h"||"i"||"j"||"k"||"l"||"m"||"n"||"o"||"p"||"q"||"r"||"s"||"t"||"u"||"v"||"w"||"x"||"y"||/*and*"z")){
						if(node.children[i].name[j] === "a"){
							stringHolder = "61";
						}else if(node.children[i].name[j] === "b"){
							stringHolder = "62";
						}else if(node.children[i].name[j] === "c"){
							stringHolder = "63";
						}else if(node.children[i].name[j] === "d"){
							stringHolder = "64";
						}else if(node.children[i].name[j] === "e"){
							stringHolder = "65";
						}else if(node.children[i].name[j] === "f"){
							stringHolder = "66";
						}else if(node.children[i].name[j] === "g"){
							stringHolder = "67";
						}else if(node.children[i].name[j] === "h"){
							stringHolder = "68";
						}else if(node.children[i].name[j] === "i"){
							stringHolder = "69";
						}else if(node.children[i].name[j] === "j"){
							stringHolder = "6A";
						}else if(node.children[i].name[j] === "k"){
							stringHolder = "6B";
						}else if(node.children[i].name[j] === "l"){
							stringHolder = "6C";
						}else if(node.children[i].name[j] === "m"){
							stringHolder = "6D";
						}else if(node.children[i].name[j] === "n"){
							stringHolder = "6E";
						}else if(node.children[i].name[j] === "o"){
							stringHolder = "6F";
						}else if(node.children[i].name[j] === "p"){
							stringHolder = "70";
						}else if(node.children[i].name[j] === "q"){
							stringHolder = "71";
						}else if(node.children[i].name[j] === "r"){
							stringHolder = "72";
						}else if(node.children[i].name[j] === "s"){
							stringHolder = "73";
						}else if(node.children[i].name[j] === "t"){
							stringHolder = "74";
						}else if(node.children[i].name[j] === "u"){
							stringHolder = "75";
						}else if(node.children[i].name[j] === "v"){
							stringHolder = "76";
						}else if(node.children[i].name[j] === "w"){
							stringHolder = "77";
						}else if(node.children[i].name[j] === "x"){
							stringHolder = "78";
						}else if(node.children[i].name[j] === "y"){
							stringHolder = "79";
						}else if(node.children[i].name[j] === /*and*"z"){
							stringHolder = "7A";
						}else{
							//putMessage("That definitely shouldn't have happened");
							}
					}else if(node.children[i].name[j] == " "){
						stringHolder = "20";
					}else{
						//putMessage("That shouldn't have happened");
					}
					stringSegment = stringSegment + stringHolder;
					//putMessage(stringSegment);
				}
				stringSegment = stringSegment + "00";
				stringLength.push(stringSegment.length);
				//putMessage(stringLength);
				stringLoc++;
				stringLocTable.push("S"+stringLoc);
				addHexCode(ldaConst);
				addHexCode("S"+stringLoc);
				addHexCode(staMem);
				staticVarLoc = staticVar + staticVarNum.toString(16);
			
				addHexCode(staticVarLoc);
				addHexCode("00");
				
			}else if(node.children[i].name === ("a"||"b"||"c"||"d"||"e"||"f"||"g"||"h"||"i"||"j"||"k"||"l"||"m"||"n"||"o"||"p"||"q"||"r"||"s"||"t"||"u"||"v"||"w"||"x"||"y"||/*and*"z")){
				addHexCode();
				addHexCode();
				addHexCode();
				addHexCode();
				addHexCode();
			}else if(node.children[i].name === ("True"||"False")){
				if(node.children[i].name === "True"){
					addHexCode(ldxConst);
					addHexCode("01");
				}else{
					addHexCode(ldxConst);
					addHexCode("00");
				}
			}*/else if(node.children[i].name === "Block"){
				for (var j = 0; j < node.children[i].children.length; j++) {
					//putMessage(node.children[i].children[j].name);
					readAST(node.children[i].children[j]);
					
				}
			}
			//putMessage(node.children[i].name);
        }
		
			//putMessage(node.children[0].name);
		for (var i = 0; i < node.length; i++) {
            readAST(node[i]);
        }
		
	}
	//code gen for if statement
	function genIf (node){
		branchLoc++;
		//putMessage("if lives");
		for (var i = 0; i < node.children.length; i++) {
			//putMessage(node.children[i].name);
			//putMessage(i);
            //for (var j = 0; j < node.children[i].children.length; j++) {
					//putMessage(node.children[i].name);
					if(node.children[i].name[0] === "\""){
						//putMessage("detected string");
						if(node.children[i] != undefined){
							//putMessage("no boolop detected");
							if(node.children[i].name = "Equality"){
								//putMessage("detected equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genEquality(node, i);
							}else if(node.children[i].name = "Non_Equality"){
								//putMessage("detected non equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j+1]);
								genNonEquality(node, i);
							}else{
								cGErrorNum++;
								putMessage("ERROR a boolean experession is needed for an if statement");
							}
						}
						break;
					}else if(node.children[i].name === "a"){
					//Yeah, sorry about this its large and messy and repetitive but it works
						var tempID = node.children[i].name;
						if(node.children[i] != undefined){
							//putMessage("no boolop detected");
							if(node.children[i].name = "Equality"){
								//putMessage("detected equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genEquality(node, tempID);
							}else if(node.children[i].name = "Non_Equality"){
								//putMessage("detected non equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genNonEquality(node, tempID);
							}else{
								cGErrorNum++;
								putMessage("ERROR a boolean experession is needed for an if statement");
							}
						}
						break;
					}else if(node.children[i].name === "b"){
						var tempID = node.children[i].name;
						if(node.children[i] != undefined){
							//putMessage("no boolop detected");
							if(node.children[i].name = "Equality"){
								//putMessage("detected equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genEquality(node, tempID);
							}else if(node.children[i].name = "Non_Equality"){
								//putMessage("detected non equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genNonEquality(node, tempID);
							}else{
								cGErrorNum++;
								putMessage("ERROR a boolean experession is needed for an if statement");
							}
						}
						break;
					}else if(node.children[i].name === "c"){
						var tempID = node.children[i].name;
						if(node.children[i] != undefined){
							//putMessage("no boolop detected");
							if(node.children[i].name = "Equality"){
								//putMessage("detected equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genEquality(node, tempID);
							}else if(node.children[i].name = "Non_Equality"){
								//putMessage("detected non equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genNonEquality(node, tempID);
							}else{
								cGErrorNum++;
								putMessage("ERROR a boolean experession is needed for an if statement");
							}
						}
						break;
					}else if(node.children[i].name === "d"){
						var tempID = node.children[i].name;
						if(node.children[i] != undefined){
							//putMessage("no boolop detected");
							if(node.children[i].name = "Equality"){
								//putMessage("detected equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genEquality(node, tempID);
							}else if(node.children[i].name = "Non_Equality"){
								//putMessage("detected non equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genNonEquality(node, tempID);
							}else{
								cGErrorNum++;
								putMessage("ERROR a boolean experession is needed for an if statement");
							}
						}
						break;
					}else if(node.children[i].name === "e"){
						var tempID = node.children[i].name;
						if(node.children[i] != undefined){
							//putMessage("no boolop detected");
							if(node.children[i].name = "Equality"){
								//putMessage("detected equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genEquality(node, tempID);
							}else if(node.children[i].name = "Non_Equality"){
								//putMessage("detected non equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genNonEquality(node, tempID);
							}else{
								cGErrorNum++;
								putMessage("ERROR a boolean experession is needed for an if statement");
							}
						}
						break;
					}else if(node.children[i].name === "f"){
						var tempID = node.children[i].name;
						if(node.children[i] != undefined){
							//putMessage("no boolop detected");
							if(node.children[i].name = "Equality"){
								//putMessage("detected equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genEquality(node, tempID);
							}else if(node.children[i].name = "Non_Equality"){
								//putMessage("detected non equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genNonEquality(node, tempID);
							}else{
								cGErrorNum++;
								putMessage("ERROR a boolean experession is needed for an if statement");
							}
						}
						break;
					}else if(node.children[i].name === "g"){
						var tempID = node.children[i].name;
						if(node.children[i] != undefined){
							//putMessage("no boolop detected");
							if(node.children[i].name = "Equality"){
								//putMessage("detected equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genEquality(node, tempID);
							}else if(node.children[i].name = "Non_Equality"){
								//putMessage("detected non equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genNonEquality(node, tempID);
							}else{
								cGErrorNum++;
								putMessage("ERROR a boolean experession is needed for an if statement");
							}
						}
						break;
					}else if(node.children[i].name === "h"){
						var tempID = node.children[i].name;
						if(node.children[i] != undefined){
							//putMessage("no boolop detected");
							if(node.children[i].name = "Equality"){
								//putMessage("detected equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genEquality(node, tempID);
							}else if(node.children[i].name = "Non_Equality"){
								//putMessage("detected non equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genNonEquality(node, tempID);
							}else{
								cGErrorNum++;
								putMessage("ERROR a boolean experession is needed for an if statement");
							}
						}
						break;
					}else if(node.children[i].name === "i"){
						var tempID = node.children[i].name;
						if(node.children[i] != undefined){
							//putMessage("no boolop detected");
							if(node.children[i].name = "Equality"){
								//putMessage("detected equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genEquality(node, tempID);
							}else if(node.children[i].name = "Non_Equality"){
								//putMessage("detected non equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genNonEquality(node, tempID);
							}else{
								cGErrorNum++;
								putMessage("ERROR a boolean experession is needed for an if statement");
							}
						}
						break;
					}else if(node.children[i].name === "j"){
						var tempID = node.children[i].name;
						if(node.children[i] != undefined){
							//putMessage("no boolop detected");
							if(node.children[i].name = "Equality"){
								//putMessage("detected equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genEquality(node, tempID);
							}else if(node.children[i].name = "Non_Equality"){
								//putMessage("detected non equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genNonEquality(node, tempID);
							}else{
								cGErrorNum++;
								putMessage("ERROR a boolean experession is needed for an if statement");
							}
						}
						break;
					}else if(node.children[i].name === "k"){
						var tempID = node.children[i].name;
						if(node.children[i] != undefined){
							//putMessage("no boolop detected");
							if(node.children[i].name = "Equality"){
								//putMessage("detected equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genEquality(node, tempID);
							}else if(node.children[i].name = "Non_Equality"){
								//putMessage("detected non equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genNonEquality(node, tempID);
							}else{
								cGErrorNum++;
								putMessage("ERROR a boolean experession is needed for an if statement");
							}
						}
						break;
					}else if(node.children[i].name === "l"){
						var tempID = node.children[i].name;
						if(node.children[i] != undefined){
							//putMessage("no boolop detected");
							if(node.children[i].name = "Equality"){
								//putMessage("detected equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genEquality(node, tempID);
							}else if(node.children[i].name = "Non_Equality"){
								//putMessage("detected non equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genNonEquality(node, tempID);
							}else{
								cGErrorNum++;
								putMessage("ERROR a boolean experession is needed for an if statement");
							}
						}
						break;
					}else if(node.children[i].name === "m"){
						var tempID = node.children[i].name;
						if(node.children[i] != undefined){
							//putMessage("no boolop detected");
							if(node.children[i].name = "Equality"){
								//putMessage("detected equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genEquality(node, tempID);
							}else if(node.children[i].name = "Non_Equality"){
								//putMessage("detected non equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genNonEquality(node, tempID);
							}else{
								cGErrorNum++;
								putMessage("ERROR a boolean experession is needed for an if statement");
							}
						}
						break;
					}else if(node.children[i].name === "n"){
						var tempID = node.children[i].name;
						if(node.children[i] != undefined){
							//putMessage("no boolop detected");
							if(node.children[i].name = "Equality"){
								//putMessage("detected equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genEquality(node, tempID);
							}else if(node.children[i].name = "Non_Equality"){
								//putMessage("detected non equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genNonEquality(node, tempID);
							}else{
								cGErrorNum++;
								putMessage("ERROR a boolean experession is needed for an if statement");
							}
						}
						break;
					}else if(node.children[i].name === "o"){
						var tempID = node.children[i].name;
						if(node.children[i] != undefined){
							//putMessage("no boolop detected");
							if(node.children[i].name = "Equality"){
								//putMessage("detected equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genEquality(node, tempID);
							}else if(node.children[i].name = "Non_Equality"){
								//putMessage("detected non equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genNonEquality(node, tempID);
							}else{
								cGErrorNum++;
								putMessage("ERROR a boolean experession is needed for an if statement");
							}
						}
						break;
					}else if(node.children[i].name === "p"){
						var tempID = node.children[i].name;
						if(node.children[i] != undefined){
							//putMessage("no boolop detected");
							if(node.children[i].name = "Equality"){
								//putMessage("detected equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genEquality(node, tempID);
							}else if(node.children[i].name = "Non_Equality"){
								//putMessage("detected non equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genNonEquality(node, tempID);
							}else{
								cGErrorNum++;
								putMessage("ERROR a boolean experession is needed for an if statement");
							}
						}
						break;
					}else if(node.children[i].name === "q"){
						var tempID = node.children[i].name;
						if(node.children[i] != undefined){
							//putMessage("no boolop detected");
							if(node.children[i].name = "Equality"){
								//putMessage("detected equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genEquality(node, tempID);
							}else if(node.children[i].name = "Non_Equality"){
								//putMessage("detected non equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genNonEquality(node, tempID);
							}else{
								cGErrorNum++;
								putMessage("ERROR a boolean experession is needed for an if statement");
							}
						}
						break;
					}else if(node.children[i].name === "r"){
						var tempID = node.children[i].name;
						if(node.children[i] != undefined){
							//putMessage("no boolop detected");
							if(node.children[i].name = "Equality"){
								//putMessage("detected equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genEquality(node, tempID);
							}else if(node.children[i].name = "Non_Equality"){
								//putMessage("detected non equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genNonEquality(node, tempID);
							}else{
								cGErrorNum++;
								putMessage("ERROR a boolean experession is needed for an if statement");
							}
						}
						break;
					}else if(node.children[i].name === "s"){
						var tempID = node.children[i].name;
						if(node.children[i] != undefined){
							//putMessage("no boolop detected");
							if(node.children[i].name = "Equality"){
								//putMessage("detected equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genEquality(node, tempID);
							}else if(node.children[i].name = "Non_Equality"){
								//putMessage("detected non equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genNonEquality(node, tempID);
							}else{
								cGErrorNum++;
								putMessage("ERROR a boolean experession is needed for an if statement");
							}
						}
						break;
					}else if(node.children[i].name === "t"){
						var tempID = node.children[i].name;
						if(node.children[i] != undefined){
							//putMessage("no boolop detected");
							if(node.children[i].name = "Equality"){
								//putMessage("detected equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genEquality(node, tempID);
							}else if(node.children[i].name = "Non_Equality"){
								//putMessage("detected non equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genNonEquality(node, tempID);
							}else{
								cGErrorNum++;
								putMessage("ERROR a boolean experession is needed for an if statement");
							}
						}
						break;
					}else if(node.children[i].name === "u"){
						var tempID = node.children[i].name;
						if(node.children[i] != undefined){
							//putMessage("no boolop detected");
							if(node.children[i].name = "Equality"){
								//putMessage("detected equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genEquality(node, tempID);
							}else if(node.children[i].name = "Non_Equality"){
								//putMessage("detected non equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genNonEquality(node, tempID);
							}else{
								cGErrorNum++;
								putMessage("ERROR a boolean experession is needed for an if statement");
							}
						}
						break;
					}else if(node.children[i].name === "v"){
						var tempID = node.children[i].name;
						if(node.children[i] != undefined){
							//putMessage("no boolop detected");
							if(node.children[i].name = "Equality"){
								//putMessage("detected equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genEquality(node, tempID);
							}else if(node.children[i].name = "Non_Equality"){
								//putMessage("detected non equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genNonEquality(node, tempID);
							}else{
								cGErrorNum++;
								putMessage("ERROR a boolean experession is needed for an if statement");
							}
						}
						break;
					}else if(node.children[i].name === "w"){
						var tempID = node.children[i].name;
						if(node.children[i] != undefined){
							//putMessage("no boolop detected");
							if(node.children[i].name = "Equality"){
								//putMessage("detected equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genEquality(node, tempID);
							}else if(node.children[i].name = "Non_Equality"){
								//putMessage("detected non equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genNonEquality(node, tempID);
							}else{
								cGErrorNum++;
								putMessage("ERROR a boolean experession is needed for an if statement");
							}
						}
						break;
					}else if(node.children[i].name === "x"){
						var tempID = node.children[i].name;
						if(node.children[i] != undefined){
							//putMessage("no boolop detected");
							if(node.children[i].name = "Equality"){
								//putMessage("detected equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genEquality(node, tempID);
							}else if(node.children[i].name = "Non_Equality"){
								//putMessage("detected non equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genNonEquality(node, tempID);
							}else{
								cGErrorNum++;
								putMessage("ERROR a boolean experession is needed for an if statement");
							}
						}
						break;
					}else if(node.children[i].name === "y"){
						var tempID = node.children[i].name;
						if(node.children[i] != undefined){
							//putMessage("no boolop detected");
							if(node.children[i].name = "Equality"){
								//putMessage("detected equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genEquality(node, tempID);
							}else if(node.children[i].name = "Non_Equality"){
								//putMessage("detected non equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genNonEquality(node, tempID);
							}else{
								cGErrorNum++;
								putMessage("ERROR a boolean experession is needed for an if statement");
							}
						}
						break;
					}else if(node.children[i].name === /*and*/"z"){
						var tempID = node.children[i].name;
						if(node.children[i] != undefined){
							//putMessage("no boolop detected");
							if(node.children[i].name = "Equality"){
								//putMessage("detected equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genEquality(node, tempID);
							}else if(node.children[i].name = "Non_Equality"){
								//putMessage("detected non equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genNonEquality(node, tempID);
							}else{
								cGErrorNum++;
								putMessage("ERROR a boolean experession is needed for an if statement");
							}
						}
						break;
					}else if(node.children[i].name = ("True"||"False")){
						//putMessage("detected boolean value");
						if(node.children[i] != undefined){
							//putMessage("no boolop detected");
							if(node.children[i].name = "Equality"){
								//putMessage("detected equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genEquality(node);
							}else if(node.children[i].name = "Non_Equality"){
								//putMessage("detected non equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genNonEquality(node);
							}else{
								cGErrorNum++;
								putMessage("ERROR a boolean experession is needed for an if statement");
							}
						}
						break;
					}else if(node.children[i].name = (0||1||2||3||4||5||6||7||8||9)){
						//putMessage("detected boolean value");
						if(node.children[i] != undefined){
							//putMessage("no boolop detected");
							if(node.children[i].name = "Equality"){
								//putMessage("detected equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genEquality(node);
							}else if(node.children[i].name = "Non_Equality"){
								//putMessage("detected non equality");
								//putMessage(node.children[i].children[j]+node.children[i].children[j+1]+node.children[i].children[j-1]);
								genNonEquality(node);
							}else{
								cGErrorNum++;
								putMessage("ERROR a boolean experession is needed for an if statement");
							}
						}
						break;
					}else{
						//putMessage("didn't detect id");
					}
					readAST(node.children[i]);
				
			//}
			
			
			//putMessage(node.children[i].name);
        }
			//putMessage(node.children[0].name);
		for (var i = 0; i < node.children.length; i++) {
			if(node.children[i].name = "Block"){
				for (var j = 0; j < node.children[i].children.length; j++) {
					readAST(node.children[i].children[j]);
				}
			}
		}
		for (var i = 0; i < node.length; i++) {
            readAST(node[i]);
        }
		
	}
	//code gen for non equality boolean expresssions
	function genNonEquality(node, tempID){
		branchLoc++;
		//putMessage("reached Nonequality");
		var leftSide = tempID;
		//putMessage(node.children[0].name);
		var rightSide = node.children[2];
		//putMessage(node.children[2].name);
		//I don't knowhow to handle nested boolean expressions and I don't think our grammar supports it
		if(leftSide.name == "Equality" || leftSide.name == "Non_Equality" || rightSide.name == "Equality" || rightSide.name == "Non_Equality"){
			cGErrorNum++;
			putMessage("ERROR no nested boolean experessions");
		}
		if(rightSide.name = (0||1||2||3||4||5||6||7||8||9)){
			//putMessage("detected digit");
			addHexCode(ldaConst);
    		addHexCode("0"+rightSide.name);
    		addHexCode(staMem);
    		addHexCode(staticVarLoc);
    		addHexCode("00");
		}else if(rightSide.name = ("True"||"False")){
			//putMessage("detected Boolean Value");
			addHexCode(ldaConst);
    		if(rightSide.name == "True"){
				addHexCode("01");
    		}else{
				addHexCode("00");
			}
			addHexCode(staMem);
    		addHexCode(staticVarLoc);
    		addHexCode("00");
		}else if(rightSide.name = ("a"||"b"||"c"||"d"||"e"||"f"||"g"||"h"||"i"||"j"||"k"||"l"||"m"||"n"||"o"||"p"||"q"||"r"||"s"||"t"||"u"||"v"||"w"||"x"||"y"||/*and*/"z")){
			//putMessage("detected ID");
			addHexCode(ldaConst);
    		addHexCode("0"+rightSide.name);
    		addHexCode(staMem);
    		addHexCode(staticVarLoc);
    		addHexCode("00");
		}else if(rightSide.name[0] = "\""){
			//putMessage("string detected");
			stringSegment = stringSegment + "00";
			stringLength.push(stringSegment.length);
			putMessage(stringLength);
			stringLoc++;
			stringLocTable.push("S"+stringLoc);
			addHexCode(ldaConst);
        	addHexCode("S"+stringLoc);
    		addHexCode(staMem);
		    staticVarLoc = staticVar + staticVarNum.toString(16);
			
			addHexCode(staticVarLoc);
			addHexCode("00");
		}else{
			//putMessage("nothing detected");
		}
		if(leftSide.name = ("a"||"b"||"c"||"d"||"e"||"f"||"g"||"h"||"i"||"j"||"k"||"l"||"m"||"n"||"o"||"p"||"q"||"r"||"s"||"t"||"u"||"v"||"w"||"x"||"y"||/*and*/"z")){
			addHexCode(ldxMem);
			addHexCode(staticVarLoc);
			addHexCode("00");
			addHexCode(compareMem2X);
			addHexCode(staticVarLoc);
			addHexCode("00");
		}else if(leftSide.name[0] = "\""){
			addHexCode(ldxConst);
			addHexCode("00");
			addHexCode(compareMem2X);
			addHexCode(staticVarLoc);
			addHexCode("00");
		}else if(leftSide = (0||1||2||3||4||5||6||7||8||9)){
			addHexCode(ldxConst);
    		addHexCode("0"+tempID);
    		addHexCode(compareMem2X);
			addHexCode(staticVarLoc);
			addHexCode("00");
		}else if(leftSide = ("True"||"False")){
			addHexCode(ldxConst);
			if(tempID = "True"){
				addHexCode("01");
			}else{
				addHexCode("00");
			}
			addHexCode(compareMem2X);
			addHexCode(staticVarLoc);
			addHexCode("00");
		}else{
			//putMessage("WTF");
		}
		addHexCode(branch);
		if (branchLoc<10){
			addHexCode("0"+branchLoc);
		}else if(branchLoc>=10 && branchLoc < 16){
			var tempBranchLoc = branchLoc.toString(16);
			addHexCode("0"+tempBranchLoc);
		}else{
			var tempBranchLoc = branchLoc.toString(16);
			addHexCode(tempBranchLoc);
		}
		for (var i = 0; i < node.length; i++) {
            readAST(node[i]);
        }
	}
	//code gen for equality boolean expressions
	function genEquality(node, tempID){
		branchLoc++;
		//putMessage("reached equality");
		//putMessage(tempID);
		var leftSide = node.children[0];
		//putMessage(node.children[0].name);
		var rightSide = node.children[2];
		//putMessage(rightSide.name);
		//I don't knowhow to handle nested boolean expressions and I don't think our grammar supports it
		if(tempID == "Equality" || tempID == "Non_Equality" || rightSide.name == "Equality" || rightSide.name == "Non_Equality"){
			cGErrorNum++;
			putMessage("ERROR no nested boolean experessions");
		}
		if(rightSide.name == (0||1||2||3||4||5||6||7||8||9)){
			//putMessage("detected digit");
			addHexCode(ldaConst);
    		addHexCode("0"+rightSide.name);
    		addHexCode(staMem);
    		addHexCode(staticVarLoc);
    		addHexCode("00");
		}else if(rightSide.name = ("True"||"False")){
			//putMessage("detected Boolean Value");
			addHexCode(ldaConst);
    		if(rightSide.name == "True"){
				addHexCode("01");
    		}else{
				addHexCode("00");
			}
			addHexCode(staMem);
    		addHexCode(staticVarLoc);
    		addHexCode("00");
		}else if(rightSide.name = ("a"||"b"||"c"||"d"||"e"||"f"||"g"||"h"||"i"||"j"||"k"||"l"||"m"||"n"||"o"||"p"||"q"||"r"||"s"||"t"||"u"||"v"||"w"||"x"||"y"||/*and*/"z")){
			//putMessage("detected ID");
			addHexCode(ldaConst);
    		addHexCode("00");
    		addHexCode(staMem);
    		addHexCode(staticVarLoc);
    		addHexCode("00");
		}else if(rightSide.name[0] = "\""){
			//putMessage("string detected");
			stringSegment = stringSegment + "00";
			stringLength.push(stringSegment.length);
			//putMessage(stringLength);
			stringLoc++;
			stringLocTable.push("S"+stringLoc);
			addHexCode(ldaConst);
        	addHexCode("S"+stringLoc);
    		addHexCode(staMem);
		    staticVarLoc = staticVar + staticVarNum.toString(16);
			
			addHexCode(staticVarLoc);
			addHexCode("00");
		}else{
			//putMessage("nothing detected on right side");
		}
		if(tempID = ("a"||"b"||"c"||"d"||"e"||"f"||"g"||"h"||"i"||"j"||"k"||"l"||"m"||"n"||"o"||"p"||"q"||"r"||"s"||"t"||"u"||"v"||"w"||"x"||"y"||/*and*/"z")){
			addHexCode(ldxMem);
			addHexCode(staticVarLoc);
			addHexCode("00");
			addHexCode(compareMem2X);
			addHexCode(staticVarLoc);
			addHexCode("00");
		}else if(tempID[0] = "\""){
			addHexCode(ldxConst);
			addHexCode("00");
			addHexCode(compareMem2X);
			addHexCode(staticVarLoc);
			addHexCode("00");
		}else if(tempID == (0||1||2||3||4||5||6||7||8||9)){
			addHexCode(ldxConst);
    		addHexCode("0"+tempID);
    		addHexCode(compareMem2X);
			addHexCode(staticVarLoc);
			addHexCode("00");
		}else if(tempID = ("True"||"False")){
			if(tempID = "True"){
				addHexCode(ldxConst);
				addHexCode("01");
				addHexCode(compareMem2X);
				addHexCode(staticVarLoc);
				addHexCode("00");
			}else{
				addHexCode(ldxConst);
				addHexCode("00");
				addHexCode(compareMem2X);
				addHexCode(staticVarLoc);
				addHexCode("00");
			}
		}else{
			
		}
		addHexCode(branch);
		addHexCode(branchLoc);
		for (var i = 0; i < node.length; i++) {
            readAST(node[i]);
        }
		
	}
	//temporary variables are used thorughout and so we have a backpatch function to put in the correct hex code
	function backPatch (){
		for (i = 0; i < staticVarLocTable.length; i++){
			patchNum = hexCode.length + i + 1;
			if (patchNum < 16){
				patchTxt = "0" + patchNum.toString(16);
			}else{
			//putMessage(patchNum);
			patchTxt = patchNum.toString(16);
			//putMessage(patchTxt);
			}
			var temp = "";
			temp = staticVarLocTable[i];
			//putMessage(temp);
			for (j = 0; j < hexCode.length; j++){
				if(hexCode[j] === temp){
					//putMessage(hexCode[j]);
					hexCode[j] = patchTxt;
				}
			}
		}
	}
	//similarly to backpatch strings are also given a temporary variable which replaced later on after the code segment
	function stringPatch (strExist){
		if(strExist){
			var hexTemp = hexCode.length;
			var temp = 0;
			for (i = 0; i < stringSegment.length; i=i+2){
			
				hexCode.push(stringSegment[i]+stringSegment[i+1])
			/*if((stringSegment[i]+stringSegment[i+1]) == "00"){
				//for (j = hexTemp; j < hexCode.length; j=++){
					
					//if(hexCode[j] = "00"){
						//temp = j+1;
					//}
					
				//}
			}*/
			}
			for (i = 0; i < stringLocTable.length; i++){
				if(i<1){
					patchNum = hexTemp + 1;
				}else{
					patchNum = hexTemp + ((stringLength[i]/2)-2)
				}
				//putMessage(patchNum);
				patchTxt = patchNum.toString(16);
				//putMessage(patchTxt);
				//var temp = "";
				temp = stringLocTable[i];
				//putMessage(temp);
				for (j = 0; j < hexCode.length; j++){
					if(hexCode[j] === temp){
						//putMessage(hexCode[j]);
						hexCode[j] = patchTxt;
					}
				}
			}		
			/*patchNum = hexCode.length + i + 1;
			//putMessage(patchNum);
			patchTxt = patchNum.toString(16);
			//putMessage(patchTxt);
			var temp = "";
			temp = staticVarLocTable[i].val;
			//putMessage(temp);
			for (j = 0; j < hexCode.length; j++){
				if(hexCode[j] === temp){
					//putMessage(hexCode[j]);
					hexCode[j] = patchTxt;
				}
			}*/
		}
	}
	//code gen for addition
	function genAddition(node, leftSide, rightSide){
		branchLoc++;
		//checks for multiple addition operators
		//putMessage(leftSide.name);
		//putMessage(rightSide.name);
		if((leftSide.name != ("True"||"False")) && (leftSide.name[0] != "\"") && (leftSide.name = ("a"||"b"||"c"||"d"||"e"||"f"||"g"||"h"||"i"||"j"||"k"||"l"||"m"||"n"||"o"||"p"||"q"||"r"||"s"||"t"||"u"||"v"||"w"||"x"||"y"||/*and*/"z"))){
			for(i=0; i < node.children.length; i++){
				if(node.children[i].name === "+"){
					if(i>0){
						var tempLeft = node.children[i-1];
						var tempRight = node.children[i+1];
						genAddition(node, tempLeft, tempRight);
						
					}
				}
				if(i=node.children.length){
					break;
				}
			}
			if(rightSide.name = (0||1||2||3||4||5||6||7||8||9)){
				addHexCode(ldaConst);
				
				addHexCode("0" + rightSide.name);
				addHexCode(staMem);
				//staticVarNum++;
				staticVarLoc = staticVar + staticVarNum.toString(16);
				addHexCode(staticVarLoc);
				staticVarLocTable.push(staticVarLoc);
				addHexCode("00");
			}else if(rightSide.name = ("a"||"b"||"c"||"d"||"e"||"f"||"g"||"h"||"i"||"j"||"k"||"l"||"m"||"n"||"o"||"p"||"q"||"r"||"s"||"t"||"u"||"v"||"w"||"x"||"y"||/*and*/"z")){
				addHexCode(ldaMem);
				//staticVarNum++;
				staticVarLoc = staticVar + staticVarNum.toString(16);
				addHexCode(staticVarLoc);
				staticVarLocTable.push(staticVarLoc);
				addHexCode("00");
				addHexCode(staMem);
				staticVarLoc = staticVar + staticVarNum.toString(16);
				addHexCode(staticVarLoc);
				staticVarLocTable.push(staticVarLoc);
				addHexCode("00");
			}
			if(leftSide.name = (0||1||2||3||4||5||6||7||8||9)){
				addHexCode(ldaConst);
				addHexCode("0"+leftSide.name);
				addHexCode(addWithCarry);
				//staticVarNum++;
				staticVarLoc = staticVar + staticVarNum.toString(16);
				addHexCode(staticVarLoc);
				staticVarLocTable.push(staticVarLoc);
				addHexCode("00");
				addHexCode(staMem);
				staticVarLoc = staticVar + staticVarNum.toString(16);
				addHexCode(staticVarLoc);
				staticVarLocTable.push(staticVarLoc);
				addHexCode("00");
			}else{
				cGErrorNum++
			}
			
			
			
			
			//addHexCode(staMem);
		}else{
			cGErrorNum++;
			putMessage("can't add string or booleans or IDs together with them preceding the addition or with any other type");
		}
	}
	//debugging and output section
	if(verbose){
		if (cGErrorNum > 0){
		debugTxt = debugTxt + " ERRORS DETECTED Code Generation FAILED ";
		}
		putMessage(debugTxt);
		//putMessage(cGErrorNum);
		//putMessage(cGWarningNum);
		
		
		
	}
		putMessage("6502a Output Code");
		while (hexCode.length < 256){
			hexCode.push("00");
		}
		
		if(hexCode.length > 256){
			cGErrorNum++;
			putMessage("CG ERROR - Program too large, it doesn't fit into 256 byte limit");
		}else{
			putMessage(hexCode);
		}	
	putMessage("Program " + programCount + " Code Generation produced " + cGErrorNum + " error(s) and " + cGWarningNum + " warning(s)");
}