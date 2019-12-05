/* SemanticAnalysis.js */
function semanticAnalysis(tokenStream){
  var tokens = [];
  tokens = tokenStream;
  var verbose = document.getElementById("SemanticAnalysisDebug").value
  var currentToken = 0;
  var sAErrorNum = 0;
  var sAWarningNum = 0;
  var debugTxt = "Starting Semantic Analysis ...\n ";
  var ast = new Tree();
  ast.addNode("Root", "branch");
  var scope = 0;
  var varType = "";
  var symbolTable = [];
  
  function checkVarInit(){
	if (match("T_ID", tokens[currentToken].type)){
		for (var i = 0; i < symbolTable.length; i++) {
			if(match(tokens[currentToken].value,symbolTable[i].name)){  
				if(match(symbolTable[i].init,"yes")){
					if(verbose){
						debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - VALID this variable [" + symbolTable[i].name + "] of type " + symbolTable[i].type + " has been initialized \n ";
					}
					return true;	
				}else{
					if(verbose){
						debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR this variable [" + symbolTable[i].name + "] of type " + symbolTable[i].type + " has not been initialized \n ";
					}
					return false;
				}
			}else{
				if(verbose){
					debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR this variable [" + tokens[currentToken].value + "] of type " + tokens[currentToken].type + " has not been initialized \n ";
				}
				return false;
			}
		}
	}
  }
  
  function checkUsedVar(){
	if (match("T_ID", tokens[currentToken].type)){
		for (var i = 0; i < symbolTable.length; i++) {
			if(match(tokens[currentToken].value,symbolTable[i].name)){  
				if(match(symbolTable[i].init,"yes")&&(match(symbolTable[i].used,"yes"))){
					if(verbose){
						debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - VALID this variable [" + symbolTable[i].name + "] has been used \n ";
					}
					return true;	
				}else{
					if(verbose){
						debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - WARNING this variable [" + symbolTable[i].name + "] has not been used \n ";
					}
					return false;
					sAWarningNum++;
				}
			}else{
				if(verbose){
					debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - WARNING this variable [" + tokens[currentToken].value + "]  has not been used \n ";
				}
				return false;
				sAWarningNum++;
			}
		}
	}
  }
  
  function checkVarType(){
	if (match("T_ID", tokens[currentToken].type)){
		for (var i = 0; i < symbolTable.length; i++) {
			if(match(tokens[currentToken].value,symbolTable[i].name)){
				if(match(symbolTable[i].type,"INT")||match(symbolTable[i].type,"STRING")||match(symbolTable[i].type,"BOOLEAN")){
					if(verbose){
						debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - VALID input variable [" + symbolTable[i].name + "] of type" + symbolTable[i].type + " \n ";
					}
					return true;
				}else{
					if(verbose){
						debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR variable [" + symbolTable[i].name + "] isn't a valid type" + symbolTable[i].type + " \n ";
					}
					return false;
					sAErrorNum++;
				}
			}else{
				if(symbolTable.length = i){
					if(verbose){
						debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR variable [" + tokens[currentToken].value + "] hasn't been initialized \n ";
					}
					return false;
					sAErrorNum++;
				}	
			}
		}
	}else{
		if(verbose){
			debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR invalid input expecting an [ ID ] here, not " + tokens[currentToken].type + " \n ";
		}
		return false;
		sAErrorNum++;
	}  
  }
  
  function checkVarInScope(){
	if (match("T_ID", tokens[currentToken].type)){
		for (var i = 0; i < symbolTable.length; i++) {
			if(match(tokens[currentToken].value,symbolTable[i].name)&& (match(symbolTable[i].init,"yes"))){
				if(verbose){
					debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR variable [" + tokens[currentToken].value + "] has already been initialized \n ";
				}
				return false;
				sAErrorNum++;
			}else{
				
			}
		}
	}else{
		if(verbose){
			debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR invalid input expecting an [ ID ] here, not " + tokens[currentToken].type + " \n ";
		}
		return false;
		sAErrorNum++;
	} 
  }
  //function initVar(){
	  
  //}
  function setVarUsed(){
	if (match("T_ID", tokens[currentToken].type)||match("T_ID", tokens[currentToken].type)){
		for (var i = 0; i < symbolTable.length; i++) {
			if(match(tokens[currentToken].value,symbolTable[i].name)){
				if(match(symbolTable[i].type,"INT")||match(symbolTable[i].type,"STRING")||match(symbolTable[i].type,"BOOLEAN")){
					if(verbose){
						debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - VALID input variable [" + symbolTable[i].name + "] of type" + symbolTable[i].type + " \n ";
					}
					return true;
				}else{
					if(verbose){
						debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR variable [" + symbolTable[i].name + "] isn't a valid type" + symbolTable[i].type + " \n ";
					}
					return false;
					sAErrorNum++;
				}
			}else{
				if(symbolTable.length = i){
					if(verbose){
						debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR variable [" + tokens[currentToken].value + "] hasn't been initialized \n ";
					}
					return false;
					sAErrorNum++;
				}	
			}
		}
	}else{
		if(verbose){
			debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR invalid input expecting an ID here, not " + tokens[currentToken].type + " \n ";
		}
		return false;
		sAErrorNum++;
	}   
  }
  
  ParseProgram();
  
  function ParseProgram(){
    ast.addNode("Program", "branch");
	
	
	parseBlock();
	if (match("T_EOP", tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_EOP ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		
	}else{
		//parseErrorNum++;
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR expecting [ T_EOP ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
	}
  }

  function parseBlock(){
	ast.addNode("Block", "branch");
	if (match("T_LEFT_BRACKET", tokens[currentToken].type)){
		//ast.addNode("{", "branch");
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_LEFT_BRACKET ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
		ParseStatementList();
		
		
	}else{
		parseErrorNum++;
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR expecting [ T_LEFT_BRACKET ] found ..." + tokens[currentToken].type + " \n";
		}
	}	
    if (match("T_RIGHT_BRACKET",tokens[currentToken].type)){
		//ast.endChildren();
		//ast.addNode("}", "leaf");
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_RIGHT_BRACKET ] found ..." + tokens[currentToken].type + " \n";
		}
		currentToken++;
		
	}else{
		sAErrorNum++;
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR expecting [ T_RIGHT_BRACKET_BRACKET ] found ..." + tokens[currentToken].type + " \n";
		}
	}
  }

  function ParseStatementList(){
    //ast.addNode("StatementList", "branch");
	if (match("T_PRINT",tokens[currentToken].type)||match("T_ID",tokens[currentToken].type)||match("T_INT",tokens[currentToken].type)||match("T_BOOLEAN",tokens[currentToken].type)||match("T_STRING",tokens[currentToken].type)||match("T_WHILE",tokens[currentToken].type)||match("T_IF",tokens[currentToken].type)||match("T_LEFT_BRACKET",tokens[currentToken].type)){ //["print","ID",type,"while","if","{"]
	  if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_PRINT ] or [ T_ID ] or [ T_INT ] or [ T_BOOLEAN ] or [ T_QUOTATION ] or [ T_WHILE ] or [ T_IF ] or [ T_LEFT_BRACKET ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
	  }
	  ParseStatement();
	  if(verbose){
		//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - Survived Statement \n";
	  }
	  ast.endChildren();
	  
	  ParseStatementList();
	  if(verbose){
		//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - Survived StatementList \n";
	  }
    }else{
      //epsilon production, no input
	  
	  
    }
	ast.endChildren();	
  }

  function ParseStatement(){
    //ast.addNode("Statement", "branch");
	if (match("T_PRINT",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_PRINT ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParsePrintStatement();
    }else if (match("T_ID",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_ID ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseAssignmentStatement();
	}else if (match("T_INT",tokens[currentToken].type) || match("T_BOOLEAN",tokens[currentToken].type) || match("T_STRING",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_INT ] or [ T_STRING ] or [ T_BOOLEAN ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseVarDecl();
	}else if (match("T_WHILE",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_WHILE ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseWhileStatement();
	}else if (match("T_IF",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_IF ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseIfStatement();
	}else if (match("T_LEFT_BRACKET",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_LEFT_BRACKET ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		parseBlock();
	}else{
		parseErrorNum++;
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR expecting [ T_PRINT ] or [ T_ID ] or [ T_INT ] or [ T_BOOLEAN ] or [ T_QUOTATION ] or [ T_WHILE ] or [ T_IF ] or [ T_LEFT_BRACKET ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
	}
	//ast.endChildren();
  }
  
  function ParsePrintStatement(){
	ast.addNode("PrintStatement", "branch");
	if (match("T_PRINT",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_PRINT ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
		if (match("T_LEFT_PAREN",tokens[currentToken].type)){
			//ast.addNode("(", "leaf");
			if(verbose){
				//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_LEFT_PAREN ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
			}
			currentToken++;
			ParseExpr();
		}else{
			if(verbose){
				//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR expecting [ T_LEFT_PAREN ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
			}
			currentToken++;
		}
	}else{
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR expecting [ T_PRINT ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
	}
	if (match("T_RIGHT_PAREN",tokens[currentToken].type)){
		//ast.addNode(")", "leaf");
		currentToken++;
	}else{
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR expecting [ T_RIGHT_PAREN ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
	}
	ast.endChildren();
  }
  
  function ParseAssignmentStatement(){
	  ast.addNode("AssignmentStatement", "branch");
	  ParseID();
	  checkVarInScope();
	  //checkVarInit();
	  checkVarType();
	  currentToken++;
	  if (match("T_ASSIGNMENT",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_ASSIGNMENT ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		} 
		currentToken++;
	  }else{
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR expecting [ T_ASSIGNMENT ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		} 
		currentToken++;
	  }
	  
	  ParseExpr();
	  ast.endChildren();
  }
  
  function ParseIfStatement(){
	  ast.addNode("IfStatement", "branch");
	  if (match("T_IF",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_IF ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;		
	  }else{
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR expecting [ T_IF ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	  }
	  ParseBooleanExpr();
	  parseBlock();
	  ast.endChildren();
  }
  
  function ParseWhileStatement(){
	  ast.addNode("WhileStatement", "branch");
	  if (match("T_WHILE",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_WHILE ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	  }else{
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR expecting [ T_WHILE ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		} 
		currentToken++;
	  }
	  ParseBooleanExpr();
	  parseBlock();
	  ast.endChildren();
  }
  
  function ParseVarDecl(){
	  ast.addNode("VarDecl", "branch");
	  if (match("T_INT",tokens[currentToken].type)){
		
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_INT ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseType();
		//currentToken++;	
		
	  }else if(match("T_BOOLEAN",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_BOOLEAN ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseType();
		//currentToken++;
		
	  }else if(match("T_STRING",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_QUOTATION ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		} 
		ParseType();
		//currentToken++;	
				
      }else{
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR expecting [ T_INT ] or [ T_BOOLEAN ] or [ T_QUOTATION ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		} 
		//currentToken++;
	  }
	  ParseID();
	  //ast.endChildren();
  }
  
  function ParseExpr(){
	
	//ast.addNode("Expr", "branch");
	if (match("T_DIGIT",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_DIGIT ] in Expr found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseIntExpr();  
	}else if (match("T_QUOTATION",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_QUOTATION ] in Expr found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseStringExpr();  
	}else if(match("T_LEFT_PAREN",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_LEFT_PAREN ] in Expr found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseBooleanExpr();	
    }else if(match("T_ID",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_ID  in Expr] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseID();
	}else{
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR expecting [ T_DIGIT ] or [ T_QUOTATION ] or [ T_BOOLEAN ] or [ T_ID ] in Expr found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		} 	
	}
	ast.endChildren();
  }	
  
  function ParseIntExpr(){
	//ast.addNode("IntExpr", "branch");
	if (match("T_DIGIT",tokens[currentToken].type) && (match("T_ADDITION",tokens[currentToken+1].type))){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_DIGIT ] and [ T_ADDITION ] in IntExpr found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseDigit();
		ParseIntOp();
		ParseExpr();
		
		//currentToken++;
		/*if (match("T_DIGIT",tokens[currentToken].type)){
			
		}else{
			if(verbose){
				debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR expecting [ T_DIGIT ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
			}
		}*/
	}else if (match("T_DIGIT",tokens[currentToken].type)){
		if(verbose){
				//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_DIGIT ] in IntExpr found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseDigit();
		//currentToken++;
		
	}else{
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR expecting [ T_DIGIT ] and [ T_ADDITION ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}
	ast.endChildren();
  }
  
  function ParseBooleanExpr(){
	//ast.addNode("BooleanExpr", "branch");
	if(match("T_LEFT_PAREN",tokens[currentToken].type)){
		ast.addNode("(", "leaf");
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_LEFT_PAREN ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
		ParseExpr();
		ParseBoolOp();
		
		ParseExpr();
		if(match("T_RIGHT_PAREN",tokens[currentToken].type)){
			ast.addNode(")", "leaf");
			if(verbose){
				//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_RIGHT_PAREN ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
			}
			currentToken++;
		}else{
			if(verbose){
				//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR expecting [ T_RIGHT_PAREN ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
			}
			currentToken++;
		}
	}else if(match("T_FALSE",tokens[currentToken].type)||match("T_TRUE",tokens[currentToken].type)){
		ParseBoolVal();
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_FALSE ] or [ T_TRUE ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
    }else{
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR expecting [ T_LEFT_PAREN ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}
	ast.endChildren();	
  }
  
  function ParseStringExpr(){
    //ast.addNode("StringExpr", "branch");
	if(match("T_QUOTATION",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_QUOTATION ] found ..." + tokens[currentToken].value + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}
	ast.endChildren();
  }
  
  function ParseID(){
	
	if(match("T_ID",tokens[currentToken].type)&&(match("T_INT",tokens[currentToken-1].type)||match("T_BOOLEAN",tokens[currentToken-1].type)||match("T_STRING",tokens[currentToken-1].type))){
		ast.addNode(tokens[currentToken].value, "branch");
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_ID ] found ..." + tokens[currentToken].value + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		if(match("T_INT",tokens[currentToken-1].type)){
			//ast.addNode(tokens[currentToken].value, "branch",,"yes","int",scope);
			var symbol = new Symbol(tokens[currentToken].value, "INT", scope, "yes","no");
			symbolTable.push(symbol);
			if(verbose){
				debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - VALID variable " + tokens[currentToken].value + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " has been initialized " + "\n";
			}
		}else if(match("T_BOOLEAN",tokens[currentToken-1].type)){
			//ast.addNode(tokens[currentToken].value, "branch",,"yes","boolean",scope);
			var symbol = new Symbol(tokens[currentToken].value, "BOOLEAN", scope, "yes","no");
			symbolTable.push(symbol);
		}else if(match("T_STRING",tokens[currentToken-1].type)){
			//ast.addNode(tokens[currentToken].value, "branch",,"yes","string",scope);
			var symbol = new Symbol(tokens[currentToken].value, "STRING", scope,  "yes","no");
			symbolTable.push(symbol);
		}else{
			
		}
		
		
	}else if(match("T_ID",tokens[currentToken].type)){
		ast.addNode(tokens[currentToken].value, "branch");
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_ID ] found ..." + tokens[currentToken].value + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
    }else{
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR expecting [ T_ID ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}
	ast.endChildren();
  }
  
  function ParseCharList(){
	//ast.addNode("CharList", "branch");
	if(match("T_ID",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_ID ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseChar();
	
		
	}else{
		//Epsilon production
	}
	ast.endChildren();
  }
  
  function ParseType(){
	
	if(match("T_INT",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_INT ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ast.addNode("Int", "leaf");
		currentToken++;
	}else if(match("T_STRING",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_STRING ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ast.addNode("String", "leaf");
		currentToken++;
	}else if(match("T_BOOLEAN",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_BOOLEAN ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ast.addNode("Boolean", "leaf");
		currentToken++;
	}else{
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR expecting [ T_BOOLEAN ] or [ T_INT ] or [ T_STRING ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}
	
  }
  
  function ParseChar(){
	ast.addNode("Char", "leaf");
	if (match("T_ID",tokens[currentToken].type)){
		if(verbose){
			debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_ID ] found ..." + tokens[currentToken].value + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
		ParseCharList();	
	}
  }
  
  function ParseDigit(){
	
	if (match("T_DIGIT",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_DIGIT ] in Digit found ..." + tokens[currentToken].value + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ast.addNode(tokens[currentToken].value, "leaf");
		currentToken++;	
	}else{
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR expecting [ T_DIGIT ] in Digit found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}  
  }
  
  function ParseBoolOp(){
	
	if (match("T_EQUALITY",tokens[currentToken].type)){
		ast.addNode("Equality", "leaf");
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_EQUALITY ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;	
	}else if(match("T_NON_EQUALITY",tokens[currentToken].type)){
		ast.addNode("Non_Equality", "leaf");
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_NON_EQUALITY ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}else{
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR expecting [ T_EQUALITY ] OR [ T_NON_EQUALITY ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}	
  }
  
  function ParseBoolVal(){
	if (match("T_FALSE",tokens[currentToken].type)){
		ast.addNode("False", "leaf");
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_FALSE ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;	
	}else if(match("T_TRUE",tokens[currentToken].type)){
		ast.addNode("True", "leaf");
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_TRUE ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}else{
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR expecting [ T_FALSE ] or [ T_TRUE ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}  
  }
  
  function ParseIntOp(){
	ast.addNode("Addition", "leaf");
	if (match("T_ADDITION",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - expecting [ T_ADDITION ] in IntOp found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;	
	}else{
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR expecting [ T_ADDITION ] in IntOp found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}
  }
  
  if(verbose){
    putMessage(debugTxt);
	putMessage(" AST ");
	putMessage(ast.toString());
	return ast;
  }
}

