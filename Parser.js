/* Parser.js */
function parse(tokenStream,programCount){
  var tokens = [];
  tokens = tokenStream;
  var verbose = document.getElementById("ParseDebug").value
  var currentToken = 0;
  var parseErrorNum = 0;
  var parseWarningNum = 0;
  var regularTxt = "Starting Parser ... \nProgram " + programCount + " Parsing \n";
  putMessage(regularTxt);
  var debugTxt = "Starting Parser ...\n ";
  var type = "";
  var cst = new Tree();
  cst.addNode("Root", "branch");
  ParseProgram();
  
  function ParseProgram(){
    cst.addNode("Program", "branch");
	
	
	parseBlock();
	if (match("T_EOP", tokens[currentToken].type)){
		cst.addNode("$", "Leaf");
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_EOP ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		
	}else{
		parseErrorNum++;
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - ERROR expecting [ T_EOP ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
	}
	
	if(verbose){
		if (parseErrorNum > 0){
			debugTxt = debugTxt + " ERRORS DETECTED PARSE FAILED ";
		}
		putMessage(debugTxt);
		putMessage(" CST ");
		putMessage(cst.toString());
		//return debugTxt;
		//return cst;
		putMessage("Program " + programCount + " Parsing produced " + parseErrorNum + " error(s) and " + parseWarningNum + " warning(s)");
		semanticAnalysis(tokenStream,programCount);
	}
	
	if (currentToken < tokens.length-1) {
		currentToken++;
		ParseProgram();
	
	}
	
  }

  function parseBlock(){
	cst.addNode("Block", "branch");
	if (match("T_LEFT_BRACKET", tokens[currentToken].type)){
		cst.addNode("{", "branch");
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_LEFT_BRACKET ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
		ParseStatementList();
		
		
	}else{
		parseErrorNum++;
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - ERROR expecting [ T_LEFT_BRACKET ] found ..." + tokens[currentToken].type + " \n";
		}
	}		
	if (match("T_RIGHT_BRACKET",tokens[currentToken].type)){
		cst.endChildren();
		cst.addNode("}", "leaf");
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_RIGHT_BRACKET ] found ..." + tokens[currentToken].type + " \n";
		}
		currentToken++;
		
	}else{
		parseErrorNum++;
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - ERROR expecting [ T_RIGHT_BRACKET_BRACKET ] found ..." + tokens[currentToken].type + " \n";
		}
	}
	
  }

  function ParseStatementList(){
    cst.addNode("StatementList", "branch");
	if (match("T_PRINT",tokens[currentToken].type)||match("T_ID",tokens[currentToken].type)||match("T_INT",tokens[currentToken].type)||match("T_BOOLEAN",tokens[currentToken].type)||match("T_STRING",tokens[currentToken].type)||match("T_WHILE",tokens[currentToken].type)||match("T_IF",tokens[currentToken].type)||match("T_LEFT_BRACKET",tokens[currentToken].type)){ //["print","ID",type,"while","if","{"]
	  if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_PRINT ] or [ T_ID ] or [ T_INT ] or [ T_BOOLEAN ] or [ T_QUOTATION ] or [ T_WHILE ] or [ T_IF ] or [ T_LEFT_BRACKET ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
	  }
	  ParseStatement();
	  if(verbose){
		//debugTxt = debugTxt + " DEBUG PARSER - Survived Statement \n";
	  }
	  cst.endChildren();
	  
	  ParseStatementList();
	  if(verbose){
		//debugTxt = debugTxt + " DEBUG PARSER - Survived StatementList \n";
	  }
    }else{
      //epsilon production, no input
	  
	  
    }
	cst.endChildren();	
  }

  function ParseStatement(){
    cst.addNode("Statement", "branch");
	if (match("T_PRINT",tokens[currentToken].type)){
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_PRINT ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParsePrintStatement();
    }else if (match("T_ID",tokens[currentToken].type)){
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_ID ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseAssignmentStatement();
	}else if (match("T_INT",tokens[currentToken].type) || match("T_BOOLEAN",tokens[currentToken].type) || match("T_STRING",tokens[currentToken].type)){
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_INT ] or [ T_STRING ] or [ T_BOOLEAN ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseVarDecl();
	}else if (match("T_WHILE",tokens[currentToken].type)){
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_WHILE ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseWhileStatement();
	}else if (match("T_IF",tokens[currentToken].type)){
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_IF ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseIfStatement();
	}else if (match("T_LEFT_BRACKET",tokens[currentToken].type)){
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_LEFT_BRACKET ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		parseBlock();
	}else{
		parseErrorNum++;
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - ERROR expecting [ T_PRINT ] or [ T_ID ] or [ T_INT ] or [ T_BOOLEAN ] or [ T_QUOTATION ] or [ T_WHILE ] or [ T_IF ] or [ T_LEFT_BRACKET ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
	}
	cst.endChildren();
  }
  
  function ParsePrintStatement(){
	cst.addNode("PrintStatement", "branch");
	if (match("T_PRINT",tokens[currentToken].type)){
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_PRINT ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
		if (match("T_LEFT_PAREN",tokens[currentToken].type)){
			cst.addNode("(", "leaf");
			if(verbose){
				debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_LEFT_PAREN ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
			}
			currentToken++;
			ParseExpr();
		}else{
			if(verbose){
				debugTxt = debugTxt + " DEBUG PARSER - ERROR expecting [ T_LEFT_PAREN ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
			}
			currentToken++;
		}
	}else{
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - ERROR expecting [ T_PRINT ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
	}
	if (match("T_RIGHT_PAREN",tokens[currentToken].type)){
		cst.addNode(")", "leaf");
		currentToken++;
	}else{
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - ERROR expecting [ T_RIGHT_PAREN ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
	}
	cst.endChildren();
  }
  
  function ParseAssignmentStatement(){
	  cst.addNode("AssignmentStatement", "branch");
	  ParseID();
	  if (match("T_ASSIGNMENT",tokens[currentToken].type)){
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_ASSIGNMENT ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		} 
		currentToken++;
	  }else{
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - ERROR expecting [ T_ASSIGNMENT ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		} 
		currentToken++;
	  }
	  
	  ParseExpr();
	  cst.endChildren();
  }
  
  function ParseIfStatement(){
	  cst.addNode("IfStatement", "branch");
	  if (match("T_IF",tokens[currentToken].type)){
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_IF ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;		
	  }else{
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - ERROR expecting [ T_IF ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	  }
	  ParseBooleanExpr();
	  parseBlock();
	  cst.endChildren();
  }
  
  function ParseWhileStatement(){
	  cst.addNode("WhileStatement", "branch");
	  if (match("T_WHILE",tokens[currentToken].type)){
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_WHILE ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	  }else{
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - ERROR expecting [ T_WHILE ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		} 
		currentToken++;
	  }
	  ParseBooleanExpr();
	  parseBlock();
	  cst.endChildren();
  }
  
  function ParseVarDecl(){
	  cst.addNode("VarDecl", "branch");
	  if (match("T_INT",tokens[currentToken].type)){
		
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_INT ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseType();
		//currentToken++;	
		
	  }else if(match("T_BOOLEAN",tokens[currentToken].type)){
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_BOOLEAN ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseType();
		//currentToken++;
		
	  }else if(match("T_STRING",tokens[currentToken].type)){
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_QUOTATION ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		} 
		ParseType();
		//currentToken++;	
				
      }else{
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - ERROR expecting [ T_INT ] or [ T_BOOLEAN ] or [ T_QUOTATION ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		} 
		//currentToken++;
	  }
	  ParseID();
	  cst.endChildren();
  }
  
  function ParseExpr(){
	
	cst.addNode("Expr", "branch");
	if (match("T_DIGIT",tokens[currentToken].type)){
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_DIGIT ] in Expr found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseIntExpr();  
	}else if (match("T_QUOTATION",tokens[currentToken].type)){
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_QUOTATION ] in Expr found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseStringExpr();  
	}else if(match("T_LEFT_PAREN",tokens[currentToken].type)||match("T_TRUE",tokens[currentToken].type)||match("T_FALSE",tokens[currentToken].type)){
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_LEFT_PAREN ] or [ T_TRUE ] or [ T_FALSE ] in Expr found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseBooleanExpr();	
    }else if(match("T_ID",tokens[currentToken].type)){
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_ID ] in Expr found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseID();
	}else{
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - ERROR expecting [ T_DIGIT ] or [ T_QUOTATION ] or [ T_BOOLEAN ] or [ T_ID ] in Expr found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		} 	
	}
	cst.endChildren();
  }	
  
  function ParseIntExpr(){
	cst.addNode("IntExpr", "branch");
	if (match("T_DIGIT",tokens[currentToken].type) && (match("T_ADDITION",tokens[currentToken+1].type))){
		if(verbose){
				debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_DIGIT ] and [ T_ADDITION ] in IntExpr found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseDigit();
		ParseIntOp();
		ParseExpr();
		
		//currentToken++;
		/*if (match("T_DIGIT",tokens[currentToken].type)){
			
		}else{
			if(verbose){
				debugTxt = debugTxt + " DEBUG PARSER - ERROR expecting [ T_DIGIT ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
			}
		}*/
	}else if (match("T_DIGIT",tokens[currentToken].type)){
		if(verbose){
				debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_DIGIT ] in IntExpr found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseDigit();
		//currentToken++;
		
	}else{
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - ERROR expecting [ T_DIGIT ] and [ T_ADDITION ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}
	cst.endChildren();
  }
  
  function ParseBooleanExpr(){
	cst.addNode("BooleanExpr", "branch");
	if(match("T_LEFT_PAREN",tokens[currentToken].type)){
		cst.addNode("(", "leaf");
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_LEFT_PAREN ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
		ParseExpr();
		ParseBoolOp();
		
		ParseExpr();
		if(match("T_RIGHT_PAREN",tokens[currentToken].type)){
			cst.addNode(")", "leaf");
			if(verbose){
				debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_RIGHT_PAREN ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
			}
			currentToken++;
		}else{
			if(verbose){
				debugTxt = debugTxt + " DEBUG PARSER - ERROR expecting [ T_RIGHT_PAREN ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
			}
			currentToken++;
		}
	}else if(match("T_FALSE",tokens[currentToken].type)||match("T_TRUE",tokens[currentToken].type)){
		ParseBoolVal();
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_FALSE ] or [ T_TRUE ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		//currentToken++;
    }else{
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - ERROR expecting [ T_LEFT_PAREN ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}
	cst.endChildren();	
  }
  
  function ParseStringExpr(){
    cst.addNode("StringExpr", "branch");
	if(match("T_QUOTATION",tokens[currentToken].type)){
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_QUOTATION ] found ..." + tokens[currentToken].value + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}
	cst.endChildren();
  }
  
  function ParseID(){
	
	if(match("T_ID",tokens[currentToken].type)){
		cst.addNode(tokens[currentToken].value, "branch");
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_ID ] found ..." + tokens[currentToken].value + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
		
	}else{
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - ERROR expecting [ T_ID ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}
	cst.endChildren();
  }
  
  function ParseCharList(){
	cst.addNode("CharList", "branch");
	if(match("T_ID",tokens[currentToken].type)){
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_ID ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseChar();
	
		
	}else{
		//Epsilon production
	}
	cst.endChildren();
  }
  
  function ParseType(){
	
	if(match("T_INT",tokens[currentToken].type)){
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_INT ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		cst.addNode("Int", "leaf");
		currentToken++;
	}else if(match("T_STRING",tokens[currentToken].type)){
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_STRING ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		cst.addNode("String", "leaf");
		currentToken++;
	}else if(match("T_BOOLEAN",tokens[currentToken].type)){
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_BOOLEAN ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		cst.addNode("Boolean", "leaf");
		currentToken++;
	}else{
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - ERROR expecting [ T_BOOLEAN ] or [ T_INT ] or [ T_STRING ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}
	
  }
  
  function ParseChar(){
	cst.addNode("Char", "leaf");
	if (match("T_ID",tokens[currentToken].type)){
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_ID ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
		ParseCharList();	
	}
  }
  
  function ParseDigit(){
	cst.addNode("Digit", "leaf");
	if (match("T_DIGIT",tokens[currentToken].type)){
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_DIGIT ] in Digit found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;	
	}else{
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - ERROR expecting [ T_DIGIT ] in Digit found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}  
  }
  
  function ParseBoolOp(){
	
	if (match("T_EQUALITY",tokens[currentToken].type)){
		cst.addNode("Equality", "leaf");
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_EQUALITY ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;	
	}else if(match("T_NON_EQUALITY",tokens[currentToken].type)){
		cst.addNode("Non_Equality", "leaf");
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_NON_EQUALITY ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}else{
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - ERROR expecting [ T_EQUALITY ] OR [ T_NON_EQUALITY ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}	
  }
  
  function ParseBoolVal(){
	if (match("T_FALSE",tokens[currentToken].type)){
		cst.addNode("False", "leaf");
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_FALSE ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;	
	}else if(match("T_TRUE",tokens[currentToken].type)){
		cst.addNode("True", "leaf");
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_TRUE ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}else{
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - ERROR expecting [ T_FALSE ] or [ T_TRUE ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}  
  }
  
  function ParseIntOp(){
	cst.addNode("+", "leaf");
	if (match("T_ADDITION",tokens[currentToken].type)){
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_ADDITION ] in IntOp found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;	
	}else{
		if(verbose){
			debugTxt = debugTxt + " DEBUG PARSER - ERROR expecting [ T_ADDITION ] in IntOp found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}
  }
  
  /*if(verbose){
	if (parseErrorNum > 0){
		debugTxt = debugTxt + " ERRORS DETECTED PARSE FAILED ";
	}	
	putMessage(debugTxt);
	putMessage(" CST ");
	putMessage(cst.toString());
	return debugTxt;
	return cst;
  }*/
  
} 

 