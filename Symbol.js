
// Create the token class and defines a tokens attributes
    class Symbol {
		constructor (symbolName,symbolLine,symbolPos,symbolType, symbolScope, symbolInit, symbolUsed){
			this.name = symbolName;
			this.line = symbolLine;
			this.pos = symbolPos;
			this.type = symbolType;
			this.scope = symbolScope;
			this.init = symbolInit;
			this.used = symbolUsed;
			
		}
	}