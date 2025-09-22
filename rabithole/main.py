import operator as op

# Step 1: Tokenizer
def tokenize(chars):
    return chars.replace('(', ' ( ').replace(')', ' ) ').split()

# Step 2: Parser → turns tokens into nested lists
def parse(tokens):
    if not tokens:
        raise SyntaxError("unexpected EOF")
    token = tokens.pop(0)
    if token == '(':
        L = []
        while tokens[0] != ')':
            L.append(parse(tokens))
        tokens.pop(0)  # pop ')'
        return L
    elif token == ')':
        raise SyntaxError("unexpected )")
    else:
        return atom(token)

# Step 3: Atoms (numbers or symbols)
def atom(token):
    try:
        return int(token)
    except ValueError:
        try:
            return float(token)
        except ValueError:
            return str(token)

# Step 4: Environment (symbols → functions/values)
def standard_env():
    env = {}
    env.update({
        '+': op.add, '-': op.sub, '*': op.mul, '/': op.truediv,
        '>': op.gt, '<': op.lt, '>=': op.ge, '<=': op.le, '=': op.eq,
    })
    return env

# Step 5: Evaluator
def eval_lisp(x, env):
    if isinstance(x, str):          # variable reference
        return env[x]
    elif not isinstance(x, list):   # constant literal
        return x
    elif x[0] == 'define':          # (define var exp)
        (_, var, exp) = x
        env[var] = eval_lisp(exp, env)
    else:                           # (proc arg…)
        proc = eval_lisp(x[0], env)
        args = [eval_lisp(arg, env) for arg in x[1:]]
        return proc(*args)

# Runner
def run(code):
    return eval_lisp(parse(tokenize(code)), standard_env())

# Try it out
print(run("(+ 1 2)"))          # 3
print(run("(* 5 5)"))          # 25
print(run("(> 10 3)"))         # True
