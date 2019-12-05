
// Create the token class and defines a tokens attributes
    class Symbol {
		constructor (symbolName,symbolType, symbolScope, symbolInit, symbolUsed){
			this.name = symbolName;
			this.type = symbolType;
			this.scope = symbolScope;
			this.init = symbolInit;
			this.used = symbolUsed;
			
		}
	}