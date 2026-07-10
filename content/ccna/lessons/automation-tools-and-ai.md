The last mile of modern networking: tools that turn configuration into **code**, and the AI wave reshaping how networks are operated. This is the newest material on the CCNA (200-301 v1.1 added the AI topics) — and your final lesson. Finish strong.

## Configuration management: Ansible & Terraform

Hand-configuring devices doesn't scale and doesn't repeat. Configuration-as-code tools fix both:

**Ansible** — the network favorite:

- **Agentless** — connects over SSH/API; nothing installed on devices.
- **Playbooks** in YAML describe desired tasks/state.
- **Push model** — you run the playbook; it configures the fleet.
- **Idempotent** — running it twice changes nothing the second time; it enforces state, not keystrokes.

```term
- name: Ensure NTP is configured
  hosts: switches
  tasks:
    - cisco.ios.ios_ntp_global:
        servers:
          - server: 10.99.0.1
```

**Terraform** — infrastructure-as-code, strongest in cloud: **declarative** .tf files describe the end state ("these VPCs, these subnets"); Terraform plans the diff and applies it, tracking everything in a **state file**.

```diagram
{ "type": "compare", "title": "Ansible vs Terraform", "left": { "title": "Ansible", "items": ["Agentless, SSH/API push", "YAML playbooks — tasks & state", "Great for device config management", "Procedural-ish, idempotent modules"] }, "right": { "title": "Terraform", "items": ["Declarative desired-state files", "Plan → apply workflow with state file", "Great for provisioning cloud infra", "Detects & corrects drift on apply"] } }
```

(Legacy names worth recognizing: **Puppet** and **Chef** — agent-based configuration tools that preceded Ansible's dominance.)

```match
{ "prompt": "Match the tool/property to its description", "pairs": [ { "left": "Ansible", "right": "Agentless push via SSH, YAML playbooks" }, { "left": "Terraform", "right": "Declarative provisioning with a state file" }, { "left": "Idempotency", "right": "Reapplying causes no change the second time" }, { "left": "Puppet/Chef", "right": "Older agent-based config management" } ] }
```

## AI in networking — the new exam topics

The 200-301 v1.1 blueprint added AI explicitly. The concepts:

- **Predictive AI** — models trained on telemetry that *forecast and detect*: "this AP's clients will saturate at 9 AM", "this traffic pattern looks like an intrusion", "this optic is degrading — replace it before it fails."
- **Generative AI** — LLM assistants that *produce*: configurations from plain-English intent, explanations of cryptic logs, troubleshooting suggestions. (You're using one right now to study.)
- **AIOps** — AI woven into operations platforms (Catalyst Center assurance, Meraki insights): baselining "normal," flagging anomalies, and proposing — sometimes applying — remediation.

```diagram
{ "type": "flow", "title": "AIOps loop in a modern controller", "steps": [ { "label": "Telemetry", "detail": "Devices stream stats continuously" }, { "label": "Baseline", "detail": "ML learns what 'normal' looks like" }, { "label": "Detect & predict", "detail": "Anomalies flagged before users notice" }, { "label": "Recommend / remediate", "detail": "Suggested or automated fixes" } ] }
```

```callout
{ "type": "exam", "body": "Classification is the ask: PREDICTIVE AI forecasts/detects (capacity planning, anomaly detection); GENERATIVE AI creates (configs, summaries, chat answers). A scenario about 'predicting Wi-Fi congestion' is predictive; 'drafting an ACL from a plain-English request' is generative." }
```

## Guardrails — the engineer's job now

AI accelerates; it doesn't absolve. Generated configs need **review before deployment** (models hallucinate plausible-looking nonsense), AI systems consuming telemetry raise **privacy and access questions**, and automation without change control just makes mistakes faster. The engineer's value shifts from typing commands to **designing intent, validating output, and owning the blast radius**.

```sort
{ "prompt": "Order a sane AI-assisted change workflow", "items": ["Describe intent to the AI assistant", "Review the generated configuration critically", "Test in a lab / staging environment", "Deploy via automation with rollback ready", "Monitor telemetry for anomalies"] }
```

```quiz
{ "question": "A platform studies six months of interface telemetry and warns that a core uplink will hit capacity within three weeks. Which AI category is this?", "options": ["Generative AI — it generated a warning", "Predictive AI — forecasting from learned patterns", "AIOps is not real AI", "Supervised configuration management"], "answer": 1, "explanation": "Forecasting future state from historical telemetry is the definition of predictive AI. Generative AI would be, say, drafting the config to add a new uplink — creating novel content rather than predicting." }
```

**Course complete!** You've gone from "what is a network?" to SDN and AI operations. Hit the practice questions, generate a mock test, and let spaced repetition cement the details. The exam is yours to take.
