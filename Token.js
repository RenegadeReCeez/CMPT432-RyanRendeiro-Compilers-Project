
// Create the token class and defines a tokens attributes
    class Token {
		constructor (tokenType, tokenValue, tokenLine, tokenPos){
			this.type = tokenType;
			this.value = tokenValue;
			this.line = tokenLine;
			this.pos = tokenPos;
		}
	}