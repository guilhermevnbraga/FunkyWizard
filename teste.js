let messages = []

function addMessage(messages, role, content) {
    messages.push({role: role, content: content})
}

let tool = "mytool"
let args = ["foo", "bar"]


let tools = {
    "mytool": mytool
}

addMessage(messages, "system", "system prompt");
addMessage(messages, "user", "question");
addMessage(messages, "assistant", "call");
addMessage(messages, "system", tools[tool](args));

console.log(messages)

function mytool(args) {
    return ("response for " + args.join(" "));
}