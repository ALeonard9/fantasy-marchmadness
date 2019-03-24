workflow "New workflow" {
  on = "pull_request"
  resolves = ["eslint"]
}

action "eslint" {
  uses = "eslint"
  runs = "backend/node_modules/.bin/eslint backend/."
}
