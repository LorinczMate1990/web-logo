export class LogoSyntaxError extends Error {
    message : string;
    lineNumber? : number;
    charNumber? : number;

    constructor(message : string) {
        super();
        this.message = message;
    }
}


export class UnclosedBracketError extends LogoSyntaxError {
    constructor(lineNumber : number) {
        super(`Unclosed bracket in line ${lineNumber}`);
        this.lineNumber = lineNumber;
    }
}

export class UnclosedSquareBracketError extends LogoSyntaxError {
    constructor(lineNumber : number) {
        super(`Unclosed square bracket in line ${lineNumber}`);
        this.lineNumber = lineNumber;
    }
}

export class UnclosedBraceletError extends LogoSyntaxError {
    constructor(lineNumber : number) {
        super(`Unclosed bracelet in line ${lineNumber}`);
        this.lineNumber = lineNumber;
    }
}

export class TooManyClosingSquareBracketError extends LogoSyntaxError {
    constructor(lineNumber : number, charNumber : number) {
        super(`Too many closing square bracket at ${lineNumber} at ${charNumber}`);
        this.lineNumber = lineNumber;
        this.charNumber = charNumber;
    }
}

export class TooManyClosingBracketError extends LogoSyntaxError {
    constructor(lineNumber : number, charNumber : number) {
        super(`Too many closing bracket at ${lineNumber} at ${charNumber}`);
        this.lineNumber = lineNumber;
        this.charNumber = charNumber;
    }
}

export class TooManyClosingBraceletError extends LogoSyntaxError {
    constructor(lineNumber : number, charNumber : number) {
        super(`Too many closing bracelet at ${lineNumber} at ${charNumber}`);
        this.lineNumber = lineNumber;
        this.charNumber = charNumber;
    }
}