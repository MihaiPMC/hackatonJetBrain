const sourceCode = 'citeste a, b, numar\na = (4+5) % (b - 3) \n b = b + 1\nscrie a,   numar'

const KEYWORDS = [
    'citeste',
    'scrie',
    'si',
    'sau',
    'nu',
    'daca',
    'altfel',
    'cat_timp',
    'pentru',
    'executa',
    'atunci',
    'EOF',
]

class Token {
    constructor(type, value) {
        this.type = type
        this.value = value
    }
}

function isAlpha(ch) {
    return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z')
}

function lexer(sourceCode) {
    const tokens = []
    
    const src = sourceCode.split('')
    while ( src.length > 0 ) { 
        let ch = src.shift()
        if ( ch === '\n' ) {
            tokens.push(new Token('NEWLINE', ch))
        }
        else if ( ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '%' ) {
            tokens.push(new Token('OPERATOR', ch))
        }
        else if ( ch === '=' ) {
            tokens.push(new Token('ASSIGN', ch))
        }
        else if ( ch === ',' ) {
            tokens.push(new Token('COMMA', ch))
        }
        else if ( ch === '(' ) {
            tokens.push(new Token('LPAREN', ch))
        }
        else if ( ch === ')' ) {
            tokens.push(new Token('RPAREN', ch))
        }
        else {
            // Handle multi-character tokens
            if ( ch === ' ' || ch === '\t' ) {
                continue
            }
            else if ( ch >= '0' && ch <= '9' ) {
                let num = ch
                while ( src[0] >= '0' && src[0] <= '9' ) {
                    num += src.shift()
                }
                tokens.push(new Token('NUMBER', num))
            }
            else if ( isAlpha(ch) ) {
                let id = ch
                while ( isAlpha(src[0]) ) {
                    id += src.shift()
                }
                if ( KEYWORDS.includes(id) ) {
                    tokens.push(new Token('KEYWORD', id))
                }
                else {
                    tokens.push(new Token('IDENTIFIER', id))
                }
            }
            else {
                throw new Error(`Invalid character: ${ch}`)
            }
        }
    }
    tokens.push(new Token('EOF', null))
    return tokens
}

class Node {
    constructor(type, value = null, children = []) {
        this.type = type
        this.value = value
        this.children = children
    }
    addChild(node) {
        this.children.push(node)
    }
    setChildren(children) {
        this.children = children
    }
    setValue(value) {
        this.value = value
    }
    setType(type) {
        this.type = type
    }
}

function parser(tokens) {
    let instructions = []

    while ( tokens[0].type !== 'EOF' ) {
        let currToken = tokens.shift()
        switch ( currToken.type ) {
            case 'KEYWORD':
                if ( currToken.value === 'citeste' ) {
                    let vars = []
                    while (tokens.length > 0) {
                        if (tokens[0].type === 'IDENTIFIER') {
                            vars.push(tokens.shift().value)
                            if (tokens[0].type === 'COMMA') {
                                tokens.shift()
                            } else {
                                break
                            }
                        } 
                    }
                    instructions.push(new Node('INPUT', vars))
                }
                else if ( currToken.value === 'scrie' ) {
                    let vars = []
                    while (tokens.length > 0) {
                        if (tokens[0].type === 'IDENTIFIER') {
                            vars.push(tokens.shift().value)
                            if (tokens[0].type === 'COMMA') {
                                tokens.shift()
                            } else {
                                break
                            }
                        } 
                    }
                    instructions.push(new Node('OUTPUT', vars))
                }
            case 'IDENTIFIER':
                let varName = currToken.value
                if (tokens.length > 0 && tokens[0].type === 'ASSIGN') {
                    tokens.shift()
                    
                    expression = []
                    while (tokens.length > 0 && tokens[0].type !== 'NEWLINE') {
                        expression.push(tokens.shift())
                    }
                    
                    // Transformam expresia din forma infixata in forma postfixata
                    let postfixExpression = shuntingYard(expression)
            
                    // Cream nodul de atribuire si il adaugam in lista
                    instructions.push(new Node("ASSIGNMENT", varName, postfixExpression))
                }
            default:
                break
        }
    }

    const program = new Node('PROGRAM', null, instructions)

    return program
}

function shuntingYard(tokens) {
    let output = []
    let stack = []

    while (tokens.length > 0) {
        let token = tokens.shift()
        if (token.type === 'NUMBER' || token.type === 'IDENTIFIER') {
            output.push(token)
        }
        else if (token.type === 'OPERATOR') {
            while (stack.length > 0 && stack[stack.length - 1].type === 'OPERATOR') {
                let op1 = token.value
                let op2 = stack[stack.length - 1].value
                if (op1 === '+' || op1 === '-') {
                    if (op2 === '*' || op2 === '/' || op2 === '%' || op2 === '+' || op2 === '-') {
                        output.push(stack.pop())
                    }
                    else {
                        break
                    }
                }
                else if (op1 === '*' || op1 === '/' || op1 === '%') {
                    if (op2 === '*' || op2 === '/' || op2 === '%') {
                        output.push(stack.pop())
                    }
                    else {
                        break
                    }
                }
            }
            stack.push(token)
        }
        else if (token.type === 'LPAREN') {
            stack.push(token)
        }
        else if (token.type === 'RPAREN') {
            while (stack.length > 0 && stack[stack.length - 1].type !== 'LPAREN') {
                output.push(stack.pop())
            }
            stack.pop()
        }
    }

    while (stack.length > 0) {
        output.push(stack.pop())
    }

    return output
}

console.dir(parser(lexer(sourceCode)), { depth: null })