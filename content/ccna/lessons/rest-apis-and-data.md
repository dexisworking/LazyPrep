Automation tools and controllers speak one lingua franca: **REST APIs carrying JSON**. Reading JSON fluently and knowing REST's grammar are now core networking skills — the CCNA tests both directly.

## REST — the grammar of APIs

A **REST API** exposes resources at URLs and manipulates them with HTTP verbs:

| Verb | Action | CRUD |
|---|---|---|
| **GET** | Read a resource | Read |
| **POST** | Create a new resource | Create |
| **PUT / PATCH** | Replace / modify | Update |
| **DELETE** | Remove | Delete |

A real exchange with a controller:

```term
GET https://catalyst-center/api/v1/network-device
Authorization: Bearer eyJhbGciOi...

HTTP/1.1 200 OK
Content-Type: application/json
```

Know your status codes: **2xx** success (200 OK, 201 Created), **4xx** you erred (400 bad request, **401/403** auth problems, 404 not found), **5xx** the server erred. REST is **stateless** — every request carries its own authentication (usually a token in a header); the server remembers nothing between calls.

```match
{ "prompt": "Match the HTTP element to its meaning", "pairs": [ { "left": "GET", "right": "Retrieve — never modifies" }, { "left": "POST", "right": "Create a new resource" }, { "left": "401 Unauthorized", "right": "Missing/bad authentication" }, { "left": "404 Not Found", "right": "The resource URL doesn't exist" }, { "left": "Stateless", "right": "Each request self-contained, token included" } ] }
```

## JSON — read it like a native

**JSON (JavaScript Object Notation)** is how APIs express data. Four rules cover 99% of it:

- **Objects** `{ }` hold key/value pairs; **keys are always double-quoted strings**.
- **Arrays** `[ ]` hold ordered lists.
- Values: strings (`"Gi0/1"`), numbers (`1500`), booleans (`true`/`false`), `null`, or nested objects/arrays.
- No trailing commas. No single quotes. No comments.

```json
{
  "device": {
    "hostname": "SW1",
    "uptimeDays": 42,
    "interfaces": [
      { "name": "Gi0/1", "status": "up", "vlan": 10 },
      { "name": "Gi0/2", "status": "down", "vlan": null }
    ],
    "managed": true
  }
}
```

Drill: `device.interfaces[1].status` → `"down"` (arrays index from **0**).

```quiz
{ "question": "In the JSON above, what does device.interfaces[0].vlan evaluate to?", "options": ["null", "10", "\"Gi0/1\"", "20"], "answer": 1, "explanation": "interfaces[0] is the FIRST array element ({\"name\":\"Gi0/1\"...}), whose vlan key holds the number 10. Index [1] would be Gi0/2 with vlan null — zero-based indexing is the classic trap." }
```

## The other formats you'll meet

- **XML** — JSON's verbose ancestor (`<hostname>SW1</hostname>`); NETCONF's native tongue.
- **YAML** — whitespace-structured, human-friendliest; the language of Ansible playbooks. Same data, three costumes:

```diagram
{ "type": "compare", "title": "JSON vs YAML — identical data", "left": { "title": "JSON", "items": ["{ \"hostname\": \"SW1\",", "  \"vlans\": [10, 20] }", "Braces and brackets", "APIs' default"] }, "right": { "title": "YAML", "items": ["hostname: SW1", "vlans:  - 10  - 20", "Indentation is structure", "Automation tools' default"] } }
```

```callout
{ "type": "exam", "body": "Expect to (1) match HTTP verbs to CRUD, (2) spot invalid JSON (single quotes, trailing comma, unquoted key), and (3) walk a nested JSON path to a value. Also know REST calls are authenticated per-request — commonly an API token/key in a header." }
```

```sort
{ "prompt": "Order the steps of a typical authenticated REST workflow", "items": ["POST credentials to the auth endpoint", "Receive a token in the response", "Send GET with the token in a header", "Parse the JSON body of the 200 response"] }
```
