workflow "Lint" {
  on = "pull_request"
  resolves = ["Lint"]
}

action "Lint" {
  uses = "actions/action-builder/shell@master"
  runs = "backend/node_modules/.bin/eslint backend/."
}
