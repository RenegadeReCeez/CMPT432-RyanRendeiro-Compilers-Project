/* SemanticAnalysis.js */
function semanticAnalysis(tokenStream,programCount){
  var tokens = [];
  tokens = tokenStream;
  //check if debugger is on
  var verbose = document.getElementById("SemanticAnalysisDebug").value
  //track current token
  var currentToken = 0;
  //initialize error tracking
  var sAErrorNum = 0;
  //intialize warning tracking
  var sAWarningNum = 0;
  //starter text for semantic analysis
  var regularTxt = "Starting Semantic Analyzer ... \nProgram " + programCount + " Semantic Analysis \n";
  putMessage(regularTxt);
  //starter debugging text for semantic analysis
  var debugTxt = "Starting Semantic Analysis ...\n ";
  //creates AST tree
  var ast = new Tree();
  ast.addNode("Root", "branch");
  //creates symbol table tree
  var symbolTree = new symbolTable();
  //initialize the scope so the base scope is 0 when counting through with recursion
  var scope = -1;
  //tracks variable name when needed in certain functions
  var variableName = "";
  //tracks variable type when needed in certain functions
  var type= "";
  
  
  
  //checks if the variable has been initialized or not 
  //also checks the children of the current node of the symbol table tree whether its children recorded variables and checks them to see if they're initialized 
  function checkVarInit(node){
		for (i = 0; i < node.symbols.length; i++) {		
			if (node.symbols[i].init == false) {
				sAWarningNum++;
				if(verbose){
					debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - WARNING this variable [" + node.symbols[i].name + "] of type " + node.symbols[i].type + " has NOT been initialized \n ";
				}
				sAWarningNum++;
			}
		}
		if (node.children.length != 0) {
			node.children.forEach(function(child) {
				checkVarInit(child);
			});
		}else {
			/* epsilon production */
		}
  }
  //checks if the variable has been used or not
  //also checks the children of the current node of the symbol table tree whether its children recorded variables and checks them to see if they're used 
  function checkUsedVar(node){
		for (i = 0; i < node.symbols.length; i++) {		
			if (node.symbols[i].init == true && node.symbols[i].used == false) {
				sAWarningNum++;
				if(verbose){
					debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - WARNING this variable [" + node.symbols[i].name + "] on line " + node.symbols[i].line + " of type " + node.symbols[i].type + " has been initialized but NOT USED \n ";
				}
				sAWarningNum++;
			}
		}
		if (node.children.length != 0) {
			node.children.forEach(function(child) {
				checkUsedVar(child);
			});
		}else {
			/* epsilon production */
		}
  }
  //checks if the variable has been assigned a type and if it is used correctly
  function checkVarType(node,action){
		if ((node.parent != undefined || node.parent != null) && node.symbols.length > 0) {
			for (i = 0; i < node.symbols.length; i++) {
				if (node.symbols[i].name == tokens[currentToken-1].value) {
					type = node.symbols[i].type;
					if (verbose){
						debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - VALID this variable [" + node.symbols[i].name + "] on line " + tokens[currentToken-1].line + " has the type " + node.symbols[i].type +  " \n ";
					}
					break
				}else if (i == node.symbols.length-1 && (node.parent != undefined || node.parent != null)) {
					checkVarType(node.parent,action);
					break;
				}
			}
		}else if (node.parent != undefined || node.parent != null) {
			checkVarType(node.parent,action);
		}else{
			if (verbose){
				debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR this variable [" + tokens[currentToken-1].value + "] has the type " + tokens[currentToken-1].type + " on line " + tokens[currentToken-1].line + " and is " + action + " incorrectly \n ";
			}
			sAErrorNum++;
		}
  }
  //checks if the variable has been declared with the scope already
  function checkVarInScope(node){
		for(i = 0; i < node.symbols.length; i++) {
			if (variableName == node.symbols[i].name){
				if (verbose){
					debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR this variable [" + node.symbols[i].name + "] has already been declared in this scope on line " + node.symbols[i].line + " \n ";
				}
				sAErrorNum++;
			}
		}
  }
  //initializes variables
  function initVar(node){
		if ((node.parent != undefined || node.parent != null) && node.symbols.length > 0) {
			for (i = 0; i < node.symbols.length; i++) {
				if (node.symbols[i].name == tokens[currentToken-1].value) {
					node.symbols[i].init = true;
					if (verbose)
						debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - VALID this variable [" + node.symbols[i].name + "] on line " + tokens[currentToken-1].line + " has been initialized \n ";
					break
				}else if (i == node.symbols.length-1 && (node.parent != undefined || node.parent != null)) {
					initVar(node.parent);
					break;
				}
			}
		}else if (node.parent != undefined || node.parent != null) {
			initVar(node.parent);
		}
  }
  //sets variables as being used
  function setVarUsed(node){
		if ((node.parent != undefined || node.parent != null) && node.symbols.length > 0) {
			for (i = 0; i < node.symbols.length; i++) {
				if (node.symbols[i].name == tokens[currentToken-1].value) {
					node.symbols[i].used = true;
					if (verbose)
						debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - VALID this variable [" + node.symbols[i].name + "] on line " + tokens[currentToken-1].line + " has been been used \n ";
					break
				}else if (i == node.symbols.length-1 && (node.parent != undefined || node.parent != null)) {
					setVarUsed(node.parent);
					break;
				}
			}
		}else if (node.parent != undefined || node.parent != null) {
			setVarUsed(node.parent);
		}
  }
  //declares variables
  function declaredVar(node,action){
		if ((node.parent != undefined || node.parent != null) && node.symbols.length > 0) {
			for (i = 0; i < node.symbols.length; i++) {
				if (node.symbols[i].name == tokens[currentToken-1].value) {
					if (verbose)
						debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - VALID this variable [" + node.symbols[i].name + "] on line " + tokens[currentToken-1].line + " has been declared \n ";
					break
				}else if (i == node.symbols.length-1 && (node.parent != undefined || node.parent != null)) {
					declaredVar(node.parent,action);
					break;
				}
			}
		}else if (node.parent != undefined || node.parent != null) {
			declaredVar(node.parent,action);
		}else{
			if(verbose){
				debugTxt = debugTxt + " DEBUG SEMANTIC ANALYZER - ERROR this variable [" + tokens[currentToken-1].name + "] on line " + tokens[currentToken-1].line + " has been " + action + " before being declared \n ";
			}
		}			
  }
	//go through parse again to use the recursive structure to build the AST, symbol table, and catch errors and warnings
  ParseProgram();
	
	
	
	checkVarInit(symbolTree.root);
	checkUsedVar(symbolTree.root);

    function ParseProgram(){
    ast.addNode("Program", "branch");
	
	
	parseBlock();
	if (match("T_EOP", tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_EOP ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		
	}/*else if (match("T_EOP", tokens[currentToken].type)&&(currentToken < tokens.length)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG PARSER - expecting [ T_EOP ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		
			ParseProgram();
		
    }*/else{
		sAErrorNum++;
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - ERROR expecting [ T_EOP ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
	}
	if(verbose){
		if (sAErrorNum > 0){
			debugTxt = debugTxt + " ERRORS DETECTED SEMANTIC ANALYSIS FAILED ";
		}
		putMessage(debugTxt);
		//putMessage(sAErrorNum);
		//putMessage(sAWarningNum);
		putMessage(" AST ");
		putMessage(ast.toString());
		putMessage(" Symbol Table ");
		putMessage(symbolTree.toString());
		codeGen(tokenStream,ast,symbolTree,programCount);
		return ast
		return symbolTree.symbols
	}
	putMessage("Program " + programCount + " Semantic Analysis produced " + sAErrorNum + " error(s) and " + sAWarningNum + " warning(s)");
	codeGen(tokenStream,ast,symbolTree,programCount);
	//to re-parse when there are multiple programs
	if (currentToken < tokens.length-1) {
		
		currentToken++;
		ParseProgram();
	
	}
	
  }

  function parseBlock(){
	//advance the scope up one level per block
	scope++;
	symbolTree.addNode("Scope: " + scope, "branch", scope);
	ast.addNode("Block", "branch");
	if (match("T_LEFT_BRACKET", tokens[currentToken].type)){
		//ast.addNode("{", "branch");
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_LEFT_BRACKET ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
		ParseStatementList();
		
		
	}else{
		sAErrorNum++;
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - ERROR expecting [ T_LEFT_BRACKET ] found ..." + tokens[currentToken].type + " \n";
		}
	}	
    if (match("T_RIGHT_BRACKET",tokens[currentToken].type)){
		ast.endChildren();
		//ast.addNode("}", "leaf");
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_RIGHT_BRACKET ] found ..." + tokens[currentToken].type + " \n";
		}
		currentToken++;
		
	}else{
		sAErrorNum++;
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - ERROR expecting [ T_RIGHT_BRACKET_BRACKET ] found ..." + tokens[currentToken].type + " \n";
		}
	}
	symbolTree.endChildren();
  }

  function ParseStatementList(){
    //ast.addNode("StatementList", "branch");
	if (match("T_PRINT",tokens[currentToken].type)||match("T_ID",tokens[currentToken].type)||match("T_INT",tokens[currentToken].type)||match("T_BOOLEAN",tokens[currentToken].type)||match("T_STRING",tokens[currentToken].type)||match("T_WHILE",tokens[currentToken].type)||match("T_IF",tokens[currentToken].type)||match("T_LEFT_BRACKET",tokens[currentToken].type)){ //["print","ID",type,"while","if","{"]
	  if(verbose){
		//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_PRINT ] or [ T_ID ] or [ T_INT ] or [ T_BOOLEAN ] or [ T_QUOTATION ] or [ T_WHILE ] or [ T_IF ] or [ T_LEFT_BRACKET ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
	  }
	  ParseStatement();
	  if(verbose){
		//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - Survived Statement \n";
	  }
	  //ast.endChildren();
	  
	  ParseStatementList();
	  if(verbose){
		//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - Survived StatementList \n";
	  }
    }else{
      //epsilon production, no input
	  
	  
    }
	//ast.endChildren();	
  }

  function ParseStatement(){
    //ast.addNode("Statement", "branch");
	if (match("T_PRINT",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_PRINT ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParsePrintStatement();
    }else if (match("T_ID",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_ID ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseAssignmentStatement();
	}else if (match("T_INT",tokens[currentToken].type) || match("T_BOOLEAN",tokens[currentToken].type) || match("T_STRING",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_INT ] or [ T_STRING ] or [ T_BOOLEAN ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseVarDecl();
	}else if (match("T_WHILE",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_WHILE ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseWhileStatement();
	}else if (match("T_IF",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_IF ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseIfStatement();
	}else if (match("T_LEFT_BRACKET",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_LEFT_BRACKET ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		parseBlock();
	}else{
		parseErrorNum++;
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - ERROR expecting [ T_PRINT ] or [ T_ID ] or [ T_INT ] or [ T_BOOLEAN ] or [ T_QUOTATION ] or [ T_WHILE ] or [ T_IF ] or [ T_LEFT_BRACKET ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
	}
	//ast.endChildren();
  }
  
  function ParsePrintStatement(){
	ast.addNode("PrintStatement", "branch");
	if (match("T_PRINT",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_PRINT ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
		if (match("T_LEFT_PAREN",tokens[currentToken].type)){
			//ast.addNode("(", "leaf");
			if(verbose){
				//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_LEFT_PAREN ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
			}
			currentToken++;
			ParseExpr();
		}else{
			if(verbose){
				//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - ERROR expecting [ T_LEFT_PAREN ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
			}
			currentToken++;
		}
	}else{
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - ERROR expecting [ T_PRINT ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
	}
	if (match("T_RIGHT_PAREN",tokens[currentToken].type)){
		//ast.addNode(")", "leaf");
		currentToken++;
	}else{
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - ERROR expecting [ T_RIGHT_PAREN ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
	}
	ast.endChildren();
  }
  
  function ParseAssignmentStatement(){
	  ast.addNode("AssignmentStatement", "branch");
	  ParseID();
	  //check to make sure the variableis declared
	  declaredVar(symbolTree.cur,"Assigned");
	  //check the variables type to make sure its right
	  checkVarType(symbolTree.cur,"Assigned");
	  //Declares the variable as initialized 
	  initVar(symbolTree.cur);
	  if (match("T_ASSIGNMENT",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_ASSIGNMENT ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		} 
		currentToken++;
	  }else{
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - ERROR expecting [ T_ASSIGNMENT ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
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
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_IF ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;		
	  }else{
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - ERROR expecting [ T_IF ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
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
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_WHILE ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	  }else{
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - ERROR expecting [ T_WHILE ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
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
		type = "int";
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_INT ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseType();
		//currentToken++;	
		
	  }else if(match("T_BOOLEAN",tokens[currentToken].type)){
		type = "boolean";
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_BOOLEAN ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseType();
		//currentToken++;
		
	  }else if(match("T_STRING",tokens[currentToken].type)){
		type = "string";
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_QUOTATION ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		} 
		ParseType();
		//currentToken++;	
				
      }else{
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - ERROR expecting [ T_INT ] or [ T_BOOLEAN ] or [ T_QUOTATION ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		} 
		//currentToken++;
	  }
	  ParseID();
	  //check to see if the variable is in scope or not, no redefinitiona within scope
	  checkVarInScope(symbolTree.cur);
	  //cretaes symbol for the symbol table tree
	  var symbol = new Symbol(variableName,tokens[currentToken-1].line,tokens[currentToken-1].pos, type, scope, true, false,tokens[currentToken-1].value);
	  //add the symbol to the symbol table tree's list of symbols within the current scope
	  symbolTree.cur.symbols.push(symbol);
	  ast.endChildren();
  }
  
  function ParseExpr(){
	
	//ast.addNode("Expr", "branch");
	if (match("T_DIGIT",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_DIGIT ] in Expr found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseIntExpr();  
	}else if (match("T_QUOTATION",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_QUOTATION ] in Expr found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseStringExpr();  
	}else if(match("T_LEFT_PAREN",tokens[currentToken].type)||match("T_TRUE",tokens[currentToken].type)||match("T_FALSE",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_LEFT_PAREN ] or [ T_TRUE ] or [ T_FALSE ] in Expr found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseBooleanExpr();	
    }else if(match("T_ID",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_ID ] in Expr found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseID();
		declaredVar(symbolTree.cur,"used");
		setVarUsed(symbolTree.cur);
		checkVarType(symbolTree.cur,"used");
	}else{
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - ERROR expecting [ T_DIGIT ] or [ T_QUOTATION ] or [ T_BOOLEAN ] or [ T_ID ] in Expr found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		} 	
	}
	//ast.endChildren();
  }	
  
  function ParseIntExpr(){
	//ast.addNode("IntExpr", "branch");
	if (match("T_DIGIT",tokens[currentToken].type) && (match("T_ADDITION",tokens[currentToken+1].type))){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_DIGIT ] and [ T_ADDITION ] in IntExpr found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseDigit();
		ParseIntOp();
		ParseExpr();
		
		//currentToken++;
		/*if (match("T_DIGIT",tokens[currentToken].type)){
			
		}else{
			if(verbose){
				debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - ERROR expecting [ T_DIGIT ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
			}
		}*/
	}else if (match("T_DIGIT",tokens[currentToken].type)){
		if(verbose){
				//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_DIGIT ] in IntExpr found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseDigit();
		//currentToken++;
		
	}else{
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - ERROR expecting [ T_DIGIT ] and [ T_ADDITION ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}
	//ast.endChildren();
  }
  
  function ParseBooleanExpr(){
	//ast.addNode("BooleanExpr", "branch");
	if(match("T_LEFT_PAREN",tokens[currentToken].type)){
		//ast.addNode("(", "leaf");
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_LEFT_PAREN ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
		ParseExpr();
		ParseBoolOp();
		ParseExpr();
		if(match("T_RIGHT_PAREN",tokens[currentToken].type)){
			//ast.addNode(")", "leaf");
			if(verbose){
				//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_RIGHT_PAREN ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
			}
			currentToken++;
		}else{
			if(verbose){
				//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - ERROR expecting [ T_RIGHT_PAREN ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
			}
			currentToken++;
		}
	}else if(match("T_FALSE",tokens[currentToken].type)||match("T_TRUE",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_FALSE ] or [ T_TRUE ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ParseBoolVal();
		//currentToken++;
    }else{
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - ERROR expecting [ T_LEFT_PAREN ] or [ T_TRUE ] or [ T_FALSE ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}
	//ast.endChildren();	
  }
  
  function ParseStringExpr(){
    ast.addNode(tokens[currentToken].value,"leaf");
	if(match("T_QUOTATION",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_QUOTATION ] found ..." + tokens[currentToken].value + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}
	//ast.endChildren();
  }
  
  function ParseID(){
	
	if(match("T_ID",tokens[currentToken].type)){
		ast.addNode(tokens[currentToken].value, "branch");
		variableName = tokens[currentToken].value;
		
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_ID ] found ..." + tokens[currentToken].value + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
		
	}else{
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - ERROR expecting [ T_ID ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}
	ast.endChildren();
  }
  
  function ParseCharList(){
	ast.addNode("CharList", "branch");
	if(match("T_ID",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_ID ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
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
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_INT ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ast.addNode("Int", "leaf");
		currentToken++;
	}else if(match("T_STRING",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_STRING ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ast.addNode("String", "leaf");
		currentToken++;
	}else if(match("T_BOOLEAN",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_BOOLEAN ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		ast.addNode("Boolean", "leaf");
		currentToken++;
	}else{
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - ERROR expecting [ T_BOOLEAN ] or [ T_INT ] or [ T_STRING ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}
	
  }
  
  function ParseChar(){
	ast.addNode("Char", "leaf");
	if (match("T_ID",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_ID ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
		ParseCharList();	
	}
  }
  
  function ParseDigit(){
	ast.addNode(tokens[currentToken].value, "leaf");
	if (match("T_DIGIT",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_DIGIT ] in Digit found ..." + tokens[currentToken].value + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;	
	}else{
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - ERROR expecting [ T_DIGIT ] in Digit found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}  
  }
  
  function ParseBoolOp(){
	
	if (match("T_EQUALITY",tokens[currentToken].type)){
		ast.addNode("Equality", "leaf");
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_EQUALITY ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;	
	}else if(match("T_NON_EQUALITY",tokens[currentToken].type)){
		ast.addNode("Non_Equality", "leaf");
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_NON_EQUALITY ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}else{
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - ERROR expecting [ T_EQUALITY ] OR [ T_NON_EQUALITY ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}	
  }
  
  function ParseBoolVal(){
	if (match("T_FALSE",tokens[currentToken].type)){
		ast.addNode("False", "leaf");
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_FALSE ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;	
	}else if(match("T_TRUE",tokens[currentToken].type)){
		ast.addNode("True", "leaf");
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_TRUE ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}else{
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - ERROR expecting [ T_FALSE ] or [ T_TRUE ] found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}  
  }
  
  function ParseIntOp(){
	ast.addNode("+", "leaf");
	if (match("T_ADDITION",tokens[currentToken].type)){
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - expecting [ T_ADDITION ] in IntOp found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;	
	}else{
		if(verbose){
			//debugTxt = debugTxt + " DEBUG SEMANTIC ANALYSIS - ERROR expecting [ T_ADDITION ] in IntOp found ..." + tokens[currentToken].type + " on line " + tokens[currentToken].line + " at position " + tokens[currentToken].pos + " \n";
		}
		currentToken++;
	}
  }
  
  
  /*if(verbose){
    if (sAErrorNum > 0){
		debugTxt = debugTxt + " ERRORS DETECTED SEMANTIC ANALYSIS FAILED ";
	}
	putMessage(debugTxt);
	//putMessage(sAErrorNum);
	//putMessage(sAWarningNum);
	putMessage(" AST ");
	putMessage(ast.toString());
	putMessage(" Symbol Table ");
	putMessage(symbolTree.toString());
	putMessage("Program " + programCount + " Semantic Analysis produced " + sAErrorNum + " error(s) and " + sAWarningNum + " warning(s)");


	return ast
	
	return symbolTree.symbols
  }*/
}

