workflow "Lint" {
  on = "pull_request"
  resolves = ["Lint action"]
}

action "Lint action" {
  uses = "actions/action-builder/shell@master"
  runs = "backend/node_modules/.bin/eslint backend/."
}
