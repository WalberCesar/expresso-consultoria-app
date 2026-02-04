---
description: Guide for using Taskmaster to manage task-driven development workflows
applyTo: "**/*"
---

# Taskmaster Operational Logic

## 1. Core Execution Loop

1.  **`list`**: View pending work.
2.  **`next`**: Determine priority task.
3.  **`show <id>`**: Extract requirements.
4.  **`expand <id>`**: Breakdown into subtasks (use `--research` for complexity).
5.  **`update-subtask`**: Log technical findings/diffs.
6.  **`set-status`**: Update to `in-progress` or `done`.

## 2. Trigger-Action Patterns (Tags & Context)

- **Branch Detected**: If `git checkout -b <name>`, run `task-master add-tag --from-branch`.
- **Collaboration Mentioned**: If user mentions team members, run `task-master add-tag <name> --copy-from-current`.
- **Refactor/Experiment**: If risky change proposed, run `task-master add-tag experiment-<name>`.
- **Epic/PRD Initiative**: If major feature described, create dedicated tag and run `parse-prd`.

## 3. Implementation Protocol (Iterative)

1.  **Analyze**: `show <id>` + Codebase research.
2.  **Plan**: Log file paths, line numbers, and proposed diffs using `update-subtask --id=<id> --prompt="..."`.
3.  **Execute**: Set status to `in-progress`.
4.  **Log**: For every breakthrough or failure, run `update-subtask` to record findings.
5.  **Finalize**: Verify implementation, update project rules (`.cursorrules`), and set status to `done`.

## 4. Complexity & Structure

- **Analyze Complexity**: Run `analyze_project_complexity --research` before expansion.
- **Dependencies**: Prerequisite tasks must be `done` before `next` selects a dependent task.
- **Drift**: If implementation changes requirements, run `update-task --id=<id> --prompt="..."` to sync future tasks.

## 5. Configuration Standards

- **Models**: Use `task-master models` for provider/model selection.
- **Rules**: Use `task-master rules add <profile>` to sync with assistant settings (Cline, VS Code, etc.).
- **Hierarchy**: `master` tag is reserved for high-level milestones and production-ready deliverables.

# Regras de Codificação do Projeto

## Estilo de Código e Documentação

- **Proibição de Comentários:** Não inclua comentários explicativos (inline ou blocos) no código gerado.
- **Código Autodocumentável:** Use nomes de variáveis e funções extremamente descritivos para que a lógica seja clara sem a necessidade de texto extra.
- **Clean Code:** Priorize a clareza através da estrutura do código. Se o código for complexo demais para ser entendido sem comentários, refatore-o.
