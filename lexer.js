/* lexer.js  */


    function lex() {
        // Grab the "raw" source code.
        var sourceCode = document.getElementById("taSourceCode").value;
        var verbose = document.getElementById("LexDebug").value
		// Trim the leading and trailing spaces.
        //sourceCode = trim(sourceCode);
       
		//the array that will hold the tokens to be passed on to the parser
        var tokenStream = [];
    
	    //the variables to keep count of the amount of errors and warnings the lexer has identified 
	    var lexerErrorNum = 0;
	    var lexerWarningNum = 0;
	    //line counter
        var currentLine = 1;
		var currentPos = 0;
        
		var quoteCounter = 0;
		var programCount = 1;
		var debugTxt = "";
	    var regularTxt = "Starting Lexer ... \nProgram " + programCount + " Lexical Analysis ";
		putMessage(regularTxt);
		//Lexemes many Lexemes
		var idLexeme = /[a-z]/;
		var ifLexeme = /if/;
		var intLexeme = /int/;
		var whileLexeme = /while/;
		var printLexeme = /print/;
		var falseLexeme = /false/;
		var trueLexeme = /true/;
		var stringLexeme = /string/;
		var booleanLexeme = /boolean/;
		var assignmentLexeme = /=/;
		var equalityLexeme = /(==)/;
		var digitLexeme = /[0-9]/;
		var additionLexeme = /\+/;
		var quotationLexeme = /(\"[^"]*\")/; 
		var innerQuotationLexeme = /\"(.*?)\"/;  
		var commentsLexeme = /(\/\*[^\/\*]*\*\/)/;
		var inEqualityLexeme = /(!=)/;
		var leftParenLexeme = /\(/;
		var rightParenLexeme = /\)/;
		var leftBracketLexeme = /\{/;
		var rightBracketLexeme = /\}/;
		var quotationMarkLexeme = /"/;
		var commentStartLexeme = /(\/*)/;
		var commentEndLexeme = /(\/)/;
		var newLineLexeme = /(^\n+)/;
		var whitespaceLexeme = / /;
		var EOPLexme = /\$/;
		var openCommentLexeme = /\/\*/;
		//combing all the other lexemes except for the quotation marks, comment symbols, brackets, and parentheses because \S takes all non whitespace characters
	    var grammarLexeme =  /(\/\*[^\/\*]*\*\/)|(if)|(print)|(int)|(while)|(false)|(true)|(string)|(boolean)|([a-z])|(0-9)|(\"[^"]*\")|(\/\*)|(")|(==)|(!=)|(\S)|(\n)|/g
		
		
		
        var sourceLexeme = sourceCode.split(grammarLexeme);
		var sourceLexeme1 = arrayRemove(sourceLexeme, undefined);		
		var sourceLexemes = arrayRemove(sourceLexeme1, "");
	
		
		for (var i = 0; i < sourceLexemes.length; i++) {
		    if (newLineLexeme.test(sourceLexemes[i])){
				currentLine++;
				currentPos = 0;
			}else if (quotationLexeme.test(sourceLexemes[i])){
				var token = new Token("T_QUOTATION", sourceLexemes[i], currentLine, currentPos);
				if(verbose){
					debugTxt = debugTxt + " DEBUG LEXER - " + token.type + " [ " + token.value + " ] " + " found on line " + token.line + " at position " + token.pos + "\n";
				}
				
				currentPos++;
				tokenStream.push(token);
				/*var innerQuotation = "";
				while(quotationMarkLexeme.test(sourceLexemes[i+1]) = false){
					innerQuotation = innerQuotation.concat(sourceLexemes[i+1]);
					currentPos++;
					i++;
				}
				var token = new Token("T_INNER_QUOTATION", innerQuotation, currentLine, currentPos);
				if(verbose){
					debugTxt = debugTxt + " DEBUG LEXER - " + token.type + " [ " + token.value + " ] " + " found on line " + token.line + " at position " + token.pos + "\n";
				}
				
				currentPos++;
				tokenStream.push(token);*/
			}else if (commentsLexeme.test(sourceLexemes[i])){
				var token = new Token("T_COMMENT", sourceLexemes[i], currentLine, currentPos);
				if(verbose){
					debugTxt = debugTxt + " DEBUG LEXER - " + token.type + " [ " + token.value + " ] " + " found on line " + token.line + " at position " + token.pos + "\n";
				}
				currentPos++;
				//comments are ignored but still picked up by the lexer debugger just to give the user as much info as possible;				
			}else if(quotationMarkLexeme.test(sourceLexemes[i])){
				var token = new Token("T_QUOTATION_MARK", sourceLexemes[i], currentLine, currentPos);
				if(verbose){
						debugTxt = debugTxt + " DEBUG LEXER - Warning Open quotation on line " + currentLine + " at position " +  currentPos + "\n";
				}
				/*quoteCounter++;
				if (Number.isinteger(quoteCounter/2)){
					if(verbose){
						debugTxt = debugTxt + " DEBUG LEXER - " + token.type + " [ " + token.value + " ] " + " found on line " + token.line + " at position " + token.pos + "\n";
					}
				
					
				}*/
				currentPos++;
				lexerWarningNum++;
			}else if (innerQuotationLexeme.test(sourceLexeme[i])){
				var token = new Token("T_INNER_QUOTATION", sourceLexemes[i], currentLine, currentPos);
				if(verbose){
					debugTxt = debugTxt + " DEBUG LEXER - " + token.type + " [ " + token.value + " ] " + " found on line " + token.line + " at position " + token.pos + "\n";
				}
			
				currentPos++;
				tokenStream.push(token);
			}else if(openCommentLexeme.test(sourceLexemes[i])){
				if(verbose){
					debugTxt = debugTxt + " DEBUG LEXER - Warning Open comment on line " + currentLine + " at position " +  currentPos + "\n";
				}
				currentPos++;
				lexerWarningNum++;
			}else if (whitespaceLexeme.test(sourceLexemes[i])){
				currentPos++;
			}else if (ifLexeme.test(sourceLexemes[i])){
				var token = new Token("T_IF", sourceLexemes[i], currentLine, currentPos);
				if(verbose){
					debugTxt = debugTxt + " DEBUG LEXER - " + token.type + " [ " + token.value + " ] " + " found on line " + token.line + " at position " + token.pos + "\n";
				}
				currentPos++;
				tokenStream.push(token);
				
			}else if (printLexeme.test(sourceLexemes[i])){
				var token = new Token("T_PRINT",sourceLexemes[i],currentLine, currentPos);
				if(verbose){
					debugTxt = debugTxt + " DEBUG LEXER - " + token.type + " [ " + token.value + " ] " + " found on line " + token.line + " at position " + token.pos + "\n";
				}
				currentPos++;
				tokenStream.push(token);
			}else if (intLexeme.test(sourceLexemes[i])){
				var token = new Token("T_INT",sourceLexemes[i],currentLine, currentPos);
				if(verbose){
					debugTxt = debugTxt + " DEBUG LEXER - " + token.type + " [ " + token.value + " ] " + " found on line " + token.line + " at position " + token.pos + "\n";
				}
				currentPos++;
				tokenStream.push(token);
			}else if (whileLexeme.test(sourceLexemes[i])){
				var token = new Token("T_WHILE",sourceLexemes[i],currentLine, currentPos);
				if(verbose){
					debugTxt = debugTxt + " DEBUG LEXER - " + token.type + " [ " + token.value + " ] " + " found on line " + token.line + " at position " + token.pos + "\n";
				}
				currentPos++;
				tokenStream.push(token);
			}else if (trueLexeme.test(sourceLexemes[i])){
				var token = new Token("T_TRUE",sourceLexemes[i],currentLine, currentPos);
				if(verbose){
					debugTxt = debugTxt + " DEBUG LEXER - " + token.type + " [ " + token.value + " ] " + " found on line " + token.line + " at position " + token.pos + "\n";
				}
				currentPos++;
				tokenStream.push(token);
			}else if (falseLexeme.test(sourceLexemes[i])){
				var token = new Token("T_FALSE",sourceLexemes[i],currentLine, currentPos);
				if(verbose){
					debugTxt = debugTxt + " DEBUG LEXER - " + token.type + " [ " + token.value + " ] " + " found on line " + token.line + " at position " + token.pos + "\n";
				}
				currentPos++;
				tokenStream.push(token);
			}else if (stringLexeme.test(sourceLexemes[i])){
				var token = new Token("T_STRING",sourceLexemes[i],currentLine, currentPos);
				if(verbose){
					debugTxt = debugTxt + " DEBUG LEXER - " + token.type + " [ " + token.value + " ] " + " found on line " + token.line + " at position " + token.pos + "\n";
				}
				currentPos++;
				tokenStream.push(token);
			}else if (booleanLexeme.test(sourceLexemes[i])){
				var token = new Token("T_BOOLEAN",sourceLexemes[i],currentLine, currentPos);
				if(verbose){
					debugTxt = debugTxt + " DEBUG LEXER - " + token.type + " [ " + token.value + " ] " + " found on line " + token.line + " at position " + token.pos + "\n";
				}
				currentPos++;
				tokenStream.push(token);
			}else if(idLexeme.test(sourceLexemes[i])){
	            var token = new Token("T_ID",sourceLexemes[i],currentLine, currentPos);
				if(verbose){
					debugTxt = debugTxt + " DEBUG LEXER - " + token.type + " [ " + token.value + " ] " + " found on line " + token.line + " at position " + token.pos + "\n";
				}
				currentPos++;
				tokenStream.push(token);
		    }else if(digitLexeme.test(sourceLexemes[i])){
				var token = new Token("T_DIGIT", sourceLexemes[i],currentLine, currentPos);
				if(verbose){
					debugTxt = debugTxt + " DEBUG LEXER - " + token.type + " [ " + token.value + " ] " + " found on line " + token.line + " at position " + token.pos + "\n";
				}
				currentPos++;
				tokenStream.push(token);
			}else if (equalityLexeme.test(sourceLexemes[i])){
				var token = new Token("T_EQUALITY",sourceLexemes[i],currentLine, currentPos);
				if(verbose){
					debugTxt = debugTxt + " DEBUG LEXER - " + token.type + " [ " + token.value + " ] " + " found on line " + token.line + " at position " + token.pos + "\n";
				}
				currentPos++;
				tokenStream.push(token);
			}else if (inEqualityLexeme.test(sourceLexemes[i])){
				var token = new Token("T_NON_EQUALITY",sourceLexemes[i],currentLine, currentPos);
				if(verbose){
					debugTxt = debugTxt + " DEBUG LEXER - " + token.type + " [ " + token.value + " ] " + " found on line " + token.line + " at position " + token.pos + "\n";
				}
				currentPos++;
				tokenStream.push(token);
			}else if (assignmentLexeme.test(sourceLexemes[i])){
				var token = new Token("T_ASSIGNMENT",sourceLexemes[i],currentLine, currentPos);
				if(verbose){
					debugTxt = debugTxt + " DEBUG LEXER - " + token.type + " [ " + token.value + " ] " + " found on line " + token.line + " at position " + token.pos + "\n";
				}
				currentPos++;
				tokenStream.push(token);
				
			}else if (additionLexeme.test(sourceLexemes[i])){
				var token = new Token("T_ADDITION",sourceLexemes[i],currentLine, currentPos);
				if(verbose){
					debugTxt = debugTxt + " DEBUG LEXER - " + token.type + " [ " + token.value + " ] " + " found on line " + token.line + " at position " + token.pos + "\n";
				}
				currentPos++;
				tokenStream.push(token);
			}else if (leftBracketLexeme.test(sourceLexemes[i])){
				var token = new Token("T_LEFT_BRACKET",sourceLexemes[i],currentLine, currentPos);
				if(verbose){
					debugTxt = debugTxt + " DEBUG LEXER - " + token.type + " [ " + token.value + " ] " + " found on line " + token.line + " at position " + token.pos + "\n";
				}
				currentPos++;
				tokenStream.push(token);
			}else if (leftParenLexeme.test(sourceLexemes[i])){
				var token = new Token("T_LEFT_PAREN",sourceLexemes[i],currentLine, currentPos);
				if(verbose){
					debugTxt = debugTxt + " DEBUG LEXER - " + token.type + " [ " + token.value + " ] " + " found on line " + token.line + " at position " + token.pos + "\n";
				}
				currentPos++;
				tokenStream.push(token);
			}else if (rightBracketLexeme.test(sourceLexemes[i])){
				var token = new Token("T_RIGHT_BRACKET",sourceLexemes[i],currentLine, currentPos);
				if(verbose){
					debugTxt = debugTxt + " DEBUG LEXER - " + token.type + " [ " + token.value + " ] " + " found on line " + token.line + " at position " + token.pos + "\n";
				}
				currentPos++;
				tokenStream.push(token);
			}else if (rightParenLexeme.test(sourceLexemes[i])){
				var token = new Token("T_RIGHT_PAREN",sourceLexemes[i],currentLine, currentPos);
				if(verbose){
					debugTxt = debugTxt + " DEBUG LEXER - " + token.type + " [ " + token.value + " ] " + " found on line " + token.line + " at position " + token.pos + "\n";
				}
				currentPos++;
				tokenStream.push(token);
			}else if(EOPLexme.test(sourceLexemes[i])){
				var token = new Token("T_EOP",sourceLexemes[i],currentLine, currentPos);
				if(verbose){
					debugTxt = debugTxt + " DEBUG LEXER - EOP end of program detected moving on to next program \n";
				}
				tokenStream.push(token);
				if (verbose) {
					putMessage(debugTxt);
				}
				putMessage("Program " + programCount + " Lexical analysis produced " + lexerErrorNum + " error(s) and " + lexerWarningNum + " warning(s)");
				parse(tokenStream,programCount);
				if(i<sourceLexemes.length-1){	
					programCount++;
					debugTxt=""
					tokenStream = [];
					var regularTxt = "Starting Lexer ... \nProgram " + programCount + " Lexical Analysis ";
					putMessage(regularTxt);
				}
			}else{ 
				if(verbose){
					debugTxt = debugTxt + " no lexeme matched, ERROR, illegal characters/input ... ending lexing \n";
				}
				lexerErrorNum = lexerErrorNum + 1;
				break;
			}
		}
		/*if (verbose) {
			putMessage(debugTxt);
			//putMessage(sourceLexeme);
			//putMessage(sourceLexemes);
			//putMessage(tokenStream);
			//putMessage(lexerErrorNum);
			return tokenStream;
			return debugTxt;
			return sourceLexemes;
			return sourceLexeme;
			return lexerErrorNum;
			
		}*/
		
		//putMessage("Program " + programCount + " Lexical analysis produced " + lexerErrorNum + " error(s) and " + lexerWarningNum + " warning(s)");
		
		
       
		
	    	
    }

  